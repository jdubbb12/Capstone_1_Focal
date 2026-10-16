/*

auth.ts - Diego V.
Responsible for the server-side authentication checks.
TODO: Proper testing and validation of this code.

*/
// Libs: Express for HTTP requests, etc, bcrypt for hashing, JSONWebToken for sesisons, and pg for PostgreSQL
import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jsonWT from 'jsonwebtoken';
import { Pool } from 'pg';

const router = Router();
const database = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const DUPLICATE_ITEM_VIOLATION = '23505'

router.post('/signup', async (req: Request, res: Response) => {
    const { email, password, username } = req.body;
    //console.log(req.body);
    const client = await database.connect();

    // We do this in a try, catch block as to catch any potential server-sided error and report that back as a JSON object.
    try {
        // Waiting for the client to properly connect to the Database (in this case, the script) before starting, and once we connect we submit a BEGIN
        // ensure safe and proper transactions.
        await client.query('BEGIN');

        // Hashing the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const result = await client.query(
            "INSERT INTO user_login (email, username, last_login) VALUES ($1, $2, CURRENT_DATE) RETURNING user_id, email, username",
            [email, username]
        );

        // Stores the found user, the first row, into the newUser variable. 
        const newUser = result.rows[0];

        await client.query(
            "INSERT INTO user_pass_hash (user_id, user_Hash) VALUES ($1, $2)",
            [newUser.user_id, passwordHash]
        );

        await client.query("COMMIT"); // Ending our query, thus "committing" (ha, get it?) our data to the database. 

        // Signing our user token with our very secure secret. Also, not allowing a session to exist for longer than 7 days.
        const token = jsonWT.sign({ userID: newUser.user_id }, JWT_SECRET, { expiresIn: '7d' });

        // Returning to the client their user account and the session token.
        res.status(201).json({ user: newUser, token });
    }

    catch (error: any) {
        await client.query("ROLLBACK"); // Something has gone *really* wrong, we need to roll back to the previous state.

        // DUPLICATE_ITEM_VIOLATION refers to a PostgreSQL error code when an item is a duplicate, which means this account already exists.
        if (error.code === DUPLICATE_ITEM_VIOLATION) { return res.status(400).json({ error: 'Email already registered.' }); }

        res.status(500).json({ error: 'An internal server error has occured.' });
        //console.log(error);
    }
    finally {
        client.release(); // We disconnect from the server after everything is set.
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // For these queries, we are not inputting any user data onto the database, simply retrieving and updating the database. So, no need to ensure the connection.
        const result = await database.query(
            `SELECT user_login.user_id, user_login.email, user_login.username, user_pass_hash.user_hash
            FROM user_login JOIN user_pass_hash ON user_login.user_id = user_pass_hash.user_id
            WHERE user_login.email = $1`,
            [email]
        );

        // Keep this vague, we do not want to return if a specific email exists as a record.
        if (result.rows.length === 0) { return res.status(401).json({ error: "Invalid email or password." }); }

        const user = result.rows[0];

        const pwValid = await bcrypt.compare(password, user.user_hash)

        // The same situation as above, this time for a failed password attempt.
        if (!pwValid) { return res.status(401).json({ error: "Invalid email or password." }); }

        // Update the last_login variable to the current date, as the user is now given a session.
        await database.query('UPDATE user_login SET last_login = CURRENT_DATE WHERE user_id = $1', [user.user_id]);

        const token = jsonWT.sign({ userID: user.user_id }, JWT_SECRET, { expiresIn: '7d' });

        // We return the user JSON differently as we may need to seperately access each element and the user variable above would lead to a leaked password hash
        // and other unnecessary information.
        res.status(200).json({ user: { id: user.user_id, email: user.email, username: user.username }, token });
    }
    catch (error: any) {
        res.status(500).json({ error: "An internal server error has occured." });
        //console.log(error)
    }
});

export default router;