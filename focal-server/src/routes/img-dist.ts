/*

image-dist.ts - Diego V.
API route for uploading, distributing and getting artworks from the
server, using the backend to contact the database, to retrieve the filepath
for the file and properly sending it to the client.

*/

// FOR NOW, WE ARE ASSUMING THE USER HAS PROPER ACCESS, THESE ALL NEED A PROPER WEB TOKEN TO ACCESS IN ThE FUTURE
// You can test API calls through using a REST client... Why did I never think about that?
import { Router } from 'express';
// TODO: implement proper deletion in case of error using Promises import { unlink } from "node:fs/promises";
import path from "node:path";
import Multer from 'multer';
import type { Request, Response } from 'express';
import { database } from './auth.js';


const router = Router();
const uploadDir = path.resolve(process.cwd(), "uploads/img/") // Capstone_1_Focal/focal-server/uploads/img/[files] - gets this through using the Current Working Directory
const DUPLICATE_ITEM_VIOLATION = '23505'

// Storage engine that stores images on our specified directory, and gives uploaded files a name and their extension.
const storage = Multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        // FILENAME ON SERVER: focal_${DATE}_${UUID}_${REV}.EXTENSION -- in the future. (Example: focal_1793128614_1337_v2.png)
        const srvFilename = `focal_${Date.now()}`;
        const extension = path.extname(file.originalname);
        cb(null, srvFilename + extension);
    }
})

const upload = Multer({ storage });

// In order for ANY of the file uploads (POST) to work at all, the Vue file **must** have a form
// with the following tags:
// <form action="http://example:3000/api/dist/artworks" method="post" enctype="multipart/form-data">
//  <input type="file" name="[WhateverNameIsInTheScript]" />
// </form>
// Otherwise, the data is invalid and wont upload properly and cause exceptions.

// Upload new art 
// TODO: proper upload verification and other limits / checks that wont cause further issues later.
router.post("/artworks", upload.single("image"), async (req: Request, res: Response) => {
    if (req.file === undefined) {
        return res.status(400).json({ error: "An invalid file was sent and could not be processed." })
    }
    const userID = req.body.userID; // BAD! BAD! BAD! no actual checking if authenticated !!!!!!!!! BAD!
    const title = req.body.title;
    const desc = req.body.desc;
    const imgPath = `uploads/img/${req.file.filename}`;
    const visibility = true; // :( this is bad, but for now it'll be alright. i guess....

    console.log(`[SERVER]\tClient uploaded file ${req.file.filename}`);
    const client = await database.connect();
    try {
        await client.query("BEGIN");

        const result = await client.query(
            `INSERT INTO artwork (user_id, artwork_title, artwork_description, artwork_link, creation_date, is_visible)
            VALUES ($1, $2, $3, $4, CURRENT_DATE, $5) RETURNING artwork_id`,
            [userID, title, desc, imgPath, visibility]
        );

        const newArtwork = result.rows[0];

        await client.query("COMMIT");

        // We did it! Here's some information you might need.
        res.status(201).json({
            message: "Successful upload.",
            filename: req.file.filename,
            size: req.file.size,
            artworkID: newArtwork.artwork_id,
            userID: userID,
            artTitle: title,
            description: desc,
            path: imgPath,
            visibility: visibility
        });
    }
    catch (err: any) {
        await client.query("ROLLBACK"); // Something has gone *really* wrong, we need to roll back to the previous state.

        // DUPLICATE_ITEM_VIOLATION refers to a PostgreSQL error code when an item is a duplicate, this piece of work already exists... somehow. if you reach here, you need a medal.
        // The only way I could "maybe" see this happen is if the server somehow manages to process everything at once, needs further testing...
        if (err.code === DUPLICATE_ITEM_VIOLATION) { return res.status(400).json({ error: 'Artwork already exists.' }); }

        res.status(500).json({ error: 'An internal server error has occured.' });
        //console.log(err);
    }
    finally {
        client.release(); // We disconnect from the server after everything is set.
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