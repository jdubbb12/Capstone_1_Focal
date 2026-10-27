/*

image-dist.ts - Diego V.
API route for uploading, distributing and getting artworks from the
server, using the backend to contact the database, to retrieve the filepath
for the file and properly sending it to the client.

*/

// FOR NOW, WE ARE ASSUMING THE USER HAS PROPER ACCESS, THESE ALL NEED A PROPER WEB TOKEN TO ACCESS IN ThE FUTURE
import { Router } from 'express';
import path from "node:path";
import Multer from 'multer';
import type { Request, Response } from 'express';
import { Pool } from "pg";

const router = Router();
const uploadDir = path.resolve(process.cwd(), "uploads") // Capstone_1_Focal/focal-server/uploads/[files] - gets this through using the Current Working Directory
const upload = Multer({ dest: uploadDir }); 
// no idea if this is needed right now?
// const database = new Pool({ connectionString: process.env.DATABASE_URL });
// const DUPLICATE_ITEM_VIOLATION = '23505';

// In order for ANY of the file uploads (POST) to work at all, the Vue file **must** have a form
// with the following tags:
// <form action="/API_LINK" method="post" enctype="multipart/form-data">
//  <input type="file" name="[WhateverNameIsInTheScript]" />
// </form>
// Otherwise, the data is invalid and wont upload properly and cause exceptions.

// Upload new art 
router.post("/artworks", upload.single("image"), (req: Request, res: Response) => {
    if (req.file === undefined) {
        res.status(400).json({ error: "An invalid file was sent and could not be processed."})
    }
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