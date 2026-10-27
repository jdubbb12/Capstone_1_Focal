/*

image-dist.ts - Diego V.
API route for uploading, distributing and getting artworks from the
server, using the backend to contact the database, to retrieve the filepath
for the file and properly sending it to the client.

*/

// FOR NOW, WE ARE ASSUMING THE USER HAS PROPER ACCESS, THESE ALL NEED A PROPER WEB TOKEN TO ACCESS IN ThE FUTURE
// You can test API calls through using a REST client... Why did I never think about that?
import { Router } from 'express';
import path from "node:path";
import Multer from 'multer';
import type { Request, Response } from 'express';
// import { Pool } from "pg"; -- No database implementation at the moment.

const router = Router();
const uploadDir = path.resolve(process.cwd(), "uploads/img/") // Capstone_1_Focal/focal-server/uploads/img/[files] - gets this through using the Current Working Directory
const upload = Multer({ dest: uploadDir }); 

// TODO: actually implement this
//
// const storage = Multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir);
//     },
//
//     filename: (req, file, cb) => {
//         // FILENAME ON SERVER: focal_${DATE}${USERID}.EXTENSION -- in the future. (Example: focal_1793128614_1337.png)
//         const srvFilename = `focal_${Date.now}`;
//         const extension = path.extname(file.originalname);
//         cb(null, srvFilename + extension);
//     }
// })


// In order for ANY of the file uploads (POST) to work at all, the Vue file **must** have a form
// with the following tags:
// <form action="/API_LINK" method="post" enctype="multipart/form-data">
//  <input type="file" name="[WhateverNameIsInTheScript]" />
// </form>
// Otherwise, the data is invalid and wont upload properly and cause exceptions.

// Upload new art 
router.post("/artworks", upload.single("image"), (req: Request, res: Response) => {
    if (req.file === undefined) {
        return res.status(400).json({ error: "An invalid file was sent and could not be processed."})
    }

    console.log("[INFO]\t Client uploaded file: " + req.file.filename);

    // We did it!
    res.status(201).json({
        message: "Successful upload.",
        filename: req.file.filename,
        size: req.file.size,
        path: req.file.path
    });
});

// Get a user's specfic artworks
router.get("/users/:userID/artworks", (req: Request<{ userID: string }>, res: Response) => {

});

// Get a specific piece of art
router.get("/artworks/:artworkID/img", (req: Request<{ artworkID: string }>, res: Response) => {

});

// Get speciifc information about an artwork
router.get("/artworks/:artworkID", (req: Request<{ artworkID: string }>, res: Response) => {

});

// Uploads a revision of a previously uploaded artwork
// router.post("/artworks/:artworkID/rev", upload.single("image"), (req: Request<{ artworkID: string }>, res: Response) => {

// });

// Gets a list of revision of the artwork
// router.get("/artworks/:artworkID/rev", (req: Request<{ artworkID: string }>, res: Response) => {

// });

export default router;