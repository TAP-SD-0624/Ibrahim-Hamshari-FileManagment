import fs from 'fs/promises'
import CONSTANTS from '../constants.js'
import path from 'path'
import getPath from './GetPath.js';
import { dir } from 'console';

export const getFiles = async (filesPath) => {

    try {
        filesPath = filesPath ? getPath(filesPath) : CONSTANTS.DATADIR;
        let data = await fs.readdir(filesPath);
        data = data.map((async (file) => {
            const filePath = path.join(filesPath, file);

            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                return {
                    name: file,
                    type: "directory",
                }
            }
            return {
                name: file,
                type: "file"
            };
        }))
        return await Promise.all(data)
    }
    catch (err) {
        console.log(err)
        throw new Error("Data Directory not found");
    }

}

export async function createFile(dirPath, name, data) {
    try {
        await fs.writeFile(path.join(getPath(dirPath), name), data);
    }
    catch (err) {
        console.log(err)

        throw new Error("File not created");
    }
}

export async function createDir(dirPath, name) {
    try {
        await fs.mkdir(path.join(getPath(path.join(dirPath, name))));
    }
    catch (err) {
        console.log(err)

        throw new Error("Directory not created");
    }
}

export async function deleteFilesAndDir(dirPath) {
    dirPath = await getPath(dirPath);
    try {
        await fs.rm(dirPath, { recursive: true, force: true });
    } catch (err) {
        console.log(err)

        throw new Error("File not found");
    }
}


async function copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}



export async function changeName(dirPath, oldName, newName) {
    dirPath = getPath(dirPath);
    const oldPath = path.join(dirPath, oldName);
    const newPath = path.join(dirPath, newName);

    try {
        const stat = await fs.lstat(oldPath);

        if (stat.isDirectory()) {
            await copyDirectory(oldPath, newPath);
            await fs.rmdir(oldPath, { recursive: true });
        } else {
            const data = await fs.readFile(oldPath);

            await fs.writeFile(newPath, data);

            await fs.unlink(oldPath);
        }

    } catch (err) {
        console.error(err);

        throw new Error('Rename operation failed');
    }
}



export async function getUploadedFiles(nameOfFile) {
    try {
        let data = await fs.readdir(CONSTANTS.UPLOADS);
        data = nameOfFile? data.filter(file => file == nameOfFile):data
        return data;
    }
    catch (err) {
        console.log(err)
        throw new Error("Something Went Wrong within the server");
    }
}

export async function searchFiles(name = "", ext = "", currPath = "") {
    const filtering = (file) => {
        if (!file || file.files?.length == 0) {
            return false;
        }
        return true;
    }
    const filesPath = getPath(currPath);

    try {
        let files = await fs.readdir(filesPath);
        files = await Promise.all(files.map(async file => {
            const filePath = path.join(filesPath, file);
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                let files = await searchFiles(`${name}`, ext, `${path.join(currPath, file)}`);
                return {
                    name: file,
                    type: "directory",
                    files: files
                }
            }
            if (file.toLowerCase().includes(name) && file.endsWith(ext)) return {
                name: file,
                type: "file"
            };
            return undefined;
        }))

        const data = files.filter(filtering);
        return data;
    }
    catch (err) {
        console.log(err)
        throw new Error("File Not Found");
    }
}


export async function checkFile(filePath) {
    filePath = path.join(getPath(filePath));
    try {
        const stats = await fs.stat(filePath);
        console.log(stats.isDirectory())
        if (stats.isDirectory()) {
            return true;
        }
        return false;

    } catch (error) {
        console.log(error);
        throw new Error("Something Went Wrong");
    }
}
export async function getContentOfFile(filePath) {
    filePath = path.join(getPath(filePath));
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return data;
    } catch (error) {
        console.log(error);
        throw new Error("Something Went Wrong");
    }
}