/*

storage-mw.ts
Middleware for configuring and exporting the Storage Engine from Multer, for use by any routes that may require
user generated content to be uploaded or retrieved from disk.

*/

import fs from "node:fs"
import path from "node:path";
import multer from 'multer';

const FILESIZE_LIMIT = 50 * 1024 * 1024;

// Storage engine that stores images on our specified directory, and gives uploaded files a name and their extension.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = "uploads/tmp"
        // let folder = "uploads/misc";
        // if (file.mimetype.startsWith("image/")) {
        //     folder = "uploads/img";
        // }
        // else if (file.mimetype.startsWith("video/")) {
        //     folder = "uploads/vid";
        // }
        // else if (file.mimetype.startsWith("model/")) {
        //     folder = "uploads/obj";
        // }
        fs.mkdirSync(folder, { recursive: true }); // Capstone_1_Focal/focal-server/uploads/tmp - gets this through using the Current Working Directory
        cb(null, path.resolve(process.cwd(), folder));
    },

    filename: (req, file, cb) => {
        // FILENAME ON SERVER: focal_${DATE}_${RANDOM} * 1E9 (10^9).EXTENSION
        const srvFilename = `focal_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
        // const extension = path.extname(file.originalname);
        cb(null, srvFilename);
    }
})


const upload = multer({
    storage: storage,
    limits: { fileSize: FILESIZE_LIMIT } //Filesize limit: 50MB (in bytes)
});

export default upload;