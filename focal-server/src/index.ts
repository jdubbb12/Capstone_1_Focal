/*

    index.ts - The main entry point into the backend.
    Requires a configured environment file to properly function.

 */

// Libraries required to actually start the server and begin listening for HTTP requests and do processing.
import Express from "express";
//import type { Response, Request } from "express"; Unused at the moment.
import 'dotenv/config';
import cors from "cors";
import authentication from "./routes/auth.js";
import imageDistribution from "./routes/img-dist.js"

const PORT = process.env.PORT;

// If we cant find PORT for whatever reason, we need to stop now and fix this, otherwise we will have uncaught exceptions later.
if (PORT === undefined) {
    throw new Error(`[ERROR}\tEnvironment file cannot be read! Please ensure the file exists or the server has proper permissions to read the file.`)
}

// Using Express for request and response handling, CORS to interact with our frontend, JSON to store and transfer credentials, and the API pathway to authentication.
const focalSrv = Express();
focalSrv.use(cors());
focalSrv.use(Express.json());
focalSrv.use("/api/auth", authentication);
focalSrv.use("/api/dist", imageDistribution);

// The last step, our server is setup and now ready to accept connections.
focalSrv.listen(PORT, () => {
    console.log(`[SERVER]\tServer is listening on http://localhost:${PORT}`);
});

export default focalSrv;