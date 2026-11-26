/*
    file-validation.ts
    Middleware for validating files uploaded to the server through MIME and File signatures (magic bytes)
*/

import { fileTypeFromFile } from "file-type";
import fs from "node:fs/promises";
import path from "node:path";
import type { Request, Response, NextFunction } from "express";

// These take in the extension / expected MIME types and sort them into the corect folder. TODO: later add OBJ / GLFT(?) support
const mimeTypes: Record<string, string> = {
    jpg: "img",
    jpeg: "img",
    png: "img",
    gif: "img",
    webp: "img",
    mp4: "vid",
    webm: "vid",
};

// Takes in a uploaded file, checks it's signature to ensure it can be allowed to be uploaded on the server, deals with the proper or invalid image.
export async function fileValidation(req: Request, res: Response, next: NextFunction) {
    // console.log(req.file)
    if (!req.file) {
        return res.status(400).json({ error: "No file was provided for validation." });
    }
    const tmpPath = req.file.path;

    try {
        const fileResult = await fileTypeFromFile(tmpPath);
        // console.log(fileResult);

        if (!fileResult || !mimeTypes[fileResult.ext]) {
            await fs.unlink(tmpPath) // is this a problem? likely. oh well.
            return res.status(400).json({ error: "Unsupported file format." }); // The user somehow uploads a TXT file instead of an JPEG, the server knows what a JPEG is.
        }

        const folder = `uploads/${mimeTypes[fileResult.ext]}` //Now that we've accepted this file, we need to store it properly.
        const destination = path.resolve(process.cwd(), folder);
        // console.log(destination);
        await fs.mkdir(destination, { recursive: true });

        const filename = `${req.file.filename}.${fileResult.ext}`;
        const newPath = path.join(destination, filename); //Now takes in the temporary random file, puts the proper extension and uses Multer for the filename as well.

        await fs.rename(tmpPath, newPath);

        // Do I need these? Probably, probably not?
        req.file.destination = destination;
        req.file.filename = filename;
        req.file.path = newPath;
        req.file.mimetype = fileResult.mime;

        next();
    }
    catch (err: any) {
        console.log(err);
        await fs.unlink(tmpPath).catch(() => { }); // Delete the file. Something went wrong.
        next(err);
    }
}