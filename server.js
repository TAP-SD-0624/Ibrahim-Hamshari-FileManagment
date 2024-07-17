import express from 'express'
import bodyParser from 'body-parser'
import { changeName, checkFile, createDir, createFile, deleteFilesAndDir, getContentOfFile, getFiles, getUploadedFiles, searchFiles } from './utils/Files.js'
import CONSTANTS from './constants.js'
import { encrypt, decrypt } from './utils/Encryption.js'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { createFiles, search, updateFile } from './middlewares/validation.js'
import path from 'path'
import zlib from 'zlib'
import multer from 'multer'
import fs from 'fs/promises'
import dotenv from 'dotenv'
import { tryCatch } from './utils/TryCatch.js'
dotenv.config();
const storage = multer.memoryStorage({
    destination: async function (req, file, cb) {
        const path = req.params[0];
        cb(null, CONSTANTS.UPLOADS);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }

})






const upload = multer({ storage });
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Files API",
            description: "API that lets you manipulate the files in te data folder in the server",
            contact: {
                name: "Ibrahim Hamshari"
            },
            servers: [`http://localhost:${CONSTANTS.PORT}`]
        }
    },
    apis: ["server.js"]
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
const app = express()

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocs))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs');
app.use('/public', express.static('public'))



app.get("/upload", tryCatch(async (req, res) => {
    res.render("upload")
}))

app.post("/upload", upload.single("file"), tryCatch(async (req, res) => {
    try {
        const destination = path.join(CONSTANTS.UPLOADS, req.file.originalname);
        zlib.gzip(req.file.buffer, async (err, compressed) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            const encrypted = encrypt(compressed);
            await fs.writeFile(destination, encrypted);
            res.status(201).json({ status: "success" });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
))

app.get("/files", tryCatch(async (req, res) => {
    const data = await getUploadedFiles();
    res.render("files", {
        data
    })
}))

app.get("/files/*", async (req, res) => {
    const filePath = path.join(CONSTANTS.UPLOADS, req.params[0]);

    try {
        const encrypted = await fs.readFile(filePath);
        const decrypted = decrypt(encrypted);
        zlib.gunzip(decrypted, (err, decompressed) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename=${path.basename(filePath)}`
            });

            res.end(decompressed);
        });
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: 'File not found or decompression failed' });
    }
});



/**
 * @swagger
 * /search:
 *  get:
 *    description: get the page that search for files
 *    responses:
 *      '200':
 *        description: a successful response
 */
app.get("/search", search, tryCatch(async (req, res) => {
    let name = req.query.name;
    let ext = req.query.ext;
    const data = await searchFiles(name, ext);
    const result = [];
    async function getDirectory(dir) {
        if (dir.type == "file") {
            result.push(dir);
        }
        else {
            dir.files.forEach(file => {
                file.name = `${dir.name}/${file.name}`;
                if (file.type == "directory") {
                    getDirectory(file);
                }
                else {
                    result.push(file);
                }
            })
        }
    }

    for (let file of data) {
        if (file.type == "file") {
            result.push(file);
        }
        else {
            getDirectory(file);
        }
    }
    res.render("index", {
        data: result,
        currPath: ""
    })

}))



app.get("/create/*", tryCatch(async (req, res) => {
    res.render('create', {
        type: "file",
        currPath: req.params[0]
    })
}))



app.get("/*", tryCatch(async (req, res) => {
    const path = req.params[0] == "/" ? "" : req.params[0];
    const check = await checkFile(path);
    if (check) {
        const data = await getFiles(path)
        return res.render('index', {
            data,
            currPath: path
        })
    }
    else {
        const data = await getContentOfFile(path);
        console.log(data);
        return res.render("details", {
            name: path.substr(path.lastIndexOf("/") + 1),
            data
        }
        )
    }
}))



/**
 * @swagger
 * /create/*:
 *  post:
 *    description: create a new file in the data directory
 *    responses:
 *      '201':
 *        description: a successful response
 */
app.post("/create/*", createFiles, tryCatch(async (req, res) => {
    const path = req.params[0];
    const name = req.body.name;
    const data = req.body.data;
    const type = req.body.type;
    if (type == "file") {
        await createFile(path, name, data);
    }
    if (type == "dir") {
        await createDir(path, name);
    }
    res.redirect("/" + path)
}))



/**
 * @swagger
 * /*:
 *  delete:
 *    description: delete a file or a directory in the data directory
 *    responses:
 *      '200':
 *        description: a successful response
 */
app.delete("/*", tryCatch(async (req, res) => {
    const path = req.params[0];
    const fileName = req.body.name;
    await deleteFilesAndDir(`${path}/${fileName}`);


    res.status(200).json({
        status: "success"
    })
}
))

/**
 * @swagger
 * /*:
 *  patch:
 *    description: rename the files in a directory inside of the data directory
 *    responses:
 *      '200':
 *        description: a successful response
 */
app.patch("/*", updateFile, tryCatch(async (req, res) => {
    const path = req.params[0];
    const name = req.body.name;
    const oldName = req.body.oldName;
    if (oldName == "" || name == "") {
        return res.status(400).json({
            status: "fail"
        })
    }
    await changeName(path, oldName, name);
    res.status(200).json({
        status: "success"
    })
}))


app.use((error, req, res, next) => {
    res.status(500).send(error.message);
})


app.listen(CONSTANTS.PORT, () => {
    console.log(`Server running on port ${CONSTANTS.PORT}`);
})
