import path from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));



 function getPath(pathDIR = "") {
    try {
        const dataPath = path.join(__dirname, "..", 'data', pathDIR);
        return dataPath;

    }
    catch (err) {
        throw new Error("Please provide a valid Path");
    }
}

export  function getUploadPath(pathDIR = "") {
    try {
        const dataPath = path.join(__dirname, "..", 'upload', pathDIR);
        return dataPath;

    }
    catch (err) {
        throw new Error("Please provide a valid Path");
    }
}

export default getPath;