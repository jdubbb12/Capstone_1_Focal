/*

image-dist.ts
API route for uploading, distributing and getting artworks from the
server, using the backend to contact the database, to retrieve the filepath
for the file and properly sending it to the client.

*/

// FOR NOW, WE ARE ASSUMING THE USER HAS PROPER ACCESS, THESE ALL NEED A PROPER WEB TOKEN TO ACCESS IN ThE FUTURE
// You can test API calls through using a REST client... Why did I never think about that?
import { Router } from 'express';
import { unlink } from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from 'express';
import { database } from './auth.js';
import upload from "../middleware/storage-mw.js"

const router = Router();
const DUPLICATE_ITEM_VIOLATION = '23505'

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
    const imgPath = path.relative(process.cwd(), `${req.file.destination}/${req.file.filename}`).replace(/\\/g, "/");; // bit dirty, but if I don't do this, the paths wont work on Linux/MacOS
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
        await unlink(imgPath);
        console.log("[ERROR]\tUpload failed. Deleted image.")
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
router.get("/users/:userID/artworks", async (req: Request<{ userID: string }>, res: Response) => {
    const userIDNum = Number(req.params.userID); // convert the string ID into an actual number you can use

    // if the API somehow recieved the call /users/InvalidID/artworks or /users/-1/artworks.
    if (!Number.isInteger(userIDNum) || userIDNum <= 0) {
        return res.status(400).json({ error: "An invalid user ID was provided." });
    }


    // const client = await database.connect();
    try {
        const result = await database.query(
            `SELECT * FROM artwork WHERE user_id = $1
            `, [userIDNum]);
        res.status(200).json({
            message: "Retrived the user's artwork.",
            artwork: result.rows
        })
    }
    catch (err: any) {
        res.status(500).json({
            error: "An internal server error has occured."
        });
        console.log(err);
    }
});

// Get a specific piece of art
router.get("/artworks/:artworkID/img", async (req: Request<{ artworkID: string }>, res: Response) => {
    const artworkIDNum = Number(req.params.artworkID);

    // if the API somehow recieved an invalid call or etc.
    if (!Number.isInteger(artworkIDNum) || artworkIDNum <= 0) {
        return res.status(400).json({ error: "An invalid artwork ID was provided." });
    }

    try {
        const result = await database.query(`
        SELECT artwork_link FROM artwork WHERE artwork_id = $1`,
            [artworkIDNum]);

        if (result.rows.length === 0) { // The length being 0 means nothing was found, so we return 404.
            return res.status(404).json({
                error: "The given artwork ID could not be found."
            });
        }
        const imagePath = path.resolve(process.cwd(), result.rows[0].artwork_link); // Essentially, we are creating the aboslute path for the server to get the image.
        res.sendFile(imagePath);
    }
    catch (err: any) {
        res.status(500).json({
            error: "An internal server error has occured."
        });
        console.log(err);
    }
});

// Get speciifc information about an artwork
router.get("/artworks/:artworkID", async (req: Request<{ artworkID: string }>, res: Response) => {
    const artworkIDNum = Number(req.params.artworkID); // convert the string ID into an actual number you can use

    // if the API somehow recieved an invalid call or etc.
    if (!Number.isInteger(artworkIDNum) || artworkIDNum <= 0) {
        return res.status(400).json({ error: "An invalid artwork ID was provided." });
    }


    // const client = await database.connect();
    try {
        const result = await database.query(
            `SELECT * FROM artwork WHERE artwork_id = $1
            `, [artworkIDNum]);
        res.status(200).json({
            message: "Retrived artwork.",
            artwork: result.rows[0]
        })
    }
    catch (err: any) {
        res.status(500).json({
            error: "An internal server error has occured."
        });
        console.log(err);
    }

});

// Uploads a revision of a previously uploaded artwork
router.post("/artworks/:artworkID/rev", upload.single("image"), async (req: Request<{ artworkID: string }>, res: Response) => {
    if (req.file === undefined) {
        return res.status(400).json({ error: "An invalid file was sent and could not be processed." })
    }
    const revisedArtworkID = Number(req.params.artworkID);
    const currentImage = path.relative(process.cwd(), `${req.file.destination}/${req.file.filename}`).replace(/\\/g, "/");;

    // if the API somehow recieved an invalid call or etc.
    if (!Number.isInteger(revisedArtworkID) || revisedArtworkID <= 0) {
        return res.status(400).json({ error: "An invalid artwork ID was provided." });
    }
    let client;
    // Since we are going to POST data, the bare minimum for this is a proper try, catch block.
    try {
        client = await database.connect();
        await client.query("BEGIN");

        // First, we get the current image we are replacing and its link.
        const artwork = await client.query(`
            SELECT artwork_link
            FROM artwork
            WHERE artwork_id = $1
            FOR UPDATE`,
            [revisedArtworkID]);


        if (artwork.rows.length === 0) {
            // return res.status(404).json({ error: "Artwork not found." });
            throw new Error("Artwork not found.")
        }
        const prevArtworkLink = artwork.rows[0].artwork_link;

        // Next, we check if we already have previous revisions, if we don't have any, we can assume that the link is the first revision.
        const rev = await client.query(`
            SELECT version_number
            FROM artwork_revision
            WHERE artwork_id = $1
            ORDER BY revision_id DESC
            LIMIT 1`,
            [revisedArtworkID]);

        // By default, when this is the first revision, this row wont exist. We are setting the default version as 2 because
        // when this the new record is made, it signals a revision was made.
        let revisionVersion: number = 2;

        if (rev.rows.length > 0) {
            revisionVersion = Number(rev.rows[0].version_number) + 1;
        }

        if (!Number.isInteger(revisionVersion)) {
            throw new Error("Invalid revision version. Use an integer.")
        }

        // Creating a new record holding a new revision of the image, and holding the older version.
        const result = await client.query(`
            INSERT INTO artwork_revision
            (artwork_id, prev_revision_link, current_revision_link, version_number)
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [revisedArtworkID, prevArtworkLink, currentImage, String(revisionVersion)]); // We convert the number back to a string as the database expects a VARCHAR, not a number.

        const revisedArtwork = result.rows[0];

        // We are now updating the original record and setting a new path to use in the previous GET route.
        await client.query(`
            UPDATE artwork
            SET artwork_link = $1
            WHERE artwork_id = $2
            `,
            [currentImage, revisedArtworkID])

        await client.query("COMMIT");

        // Sending back the JSON with the new Artwork information.
        res.status(201).json({
            message: "Successfully revised artwork.",
            artwork: {
                "artwork_id": revisedArtwork.artwork_id,
                "new_artwork_link": revisedArtwork.current_revision_link,
                "version": revisedArtwork.version_number
            }
        });
    }
    catch (err: any) {
        await client?.query("ROLLBACK");
        await unlink(currentImage);
        if (err instanceof Error && err.message === "Artwork not found.") {
            res.status(404).json({
                error: "Artwork could not be found."
            })
        }
        res.status(500).json({
            error: "An internal server error has occured."
        });
        console.log(err);
    }
    finally {
        client?.release();
    }
});

// Gets a list of revisions of an artwork
router.get("/artworks/:artworkID/rev", async (req: Request<{ artworkID: string }>, res: Response) => {
    const artworkID = Number(req.params.artworkID); // convert the string ID into an actual number you can use

    // if the API somehow recieved the call /users/InvalidID/artworks or /users/-1/artworks.
    if (!Number.isInteger(artworkID) || artworkID <= 0) {
        return res.status(400).json({ error: "An invalid artwork ID was provided." });
    }
    // const client = await database.connect();
    try {
        const result = await database.query(
            `SELECT * FROM artwork_revision 
             WHERE artwork_id = $1
            `, [artworkID]);
        res.status(200).json({
            message: "Retrived the user's artwork.",
            artwork: result.rows
        })
    }
    catch (err: any) {
        res.status(500).json({
            error: "An internal server error has occured."
        });
        console.log(err);
    }
});

export default router;