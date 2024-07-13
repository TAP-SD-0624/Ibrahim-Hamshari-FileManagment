import getPath,{getUploadPath} from "./utils/GetPath.js";
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CONSTANTS = {
    DATADIR: getPath(),
    PORT: 3000,
    UPLOADS: getUploadPath()
}

export default CONSTANTS;