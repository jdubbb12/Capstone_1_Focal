# Capstone 1: Focal

The repository for Focal, our creator platform. This platform runs off VueJS for our client end, NodeJS with Express for our server end, and PostgreSQL for our database
holding user information. The main purpose for Focal is to provide creators a platform designed for creators that allows sharing of their works, allows for constructive criticisms, and supports images, videos, and 3D models.

## Setup

To begin development, ensure you meet the following prerequisites:
- NodeJS (v24 LTS)
- PostgreSQL

After these programs have installed, clone this repository, create and checkout a new local branch to ensure 
development does not conflict with others work and progress.

### Running
1. Enter the repository folder using a terminal.
2. Run ``npm install`` at the root directory. This may take a moment to install all the scripts and dependencies required for both the client and server ends.
3. To run both the server and client together, simply run ``npm run dev`` at the root directory.
4. If you wish to run the server and client separately, change your directory into your desired application and run ``npm run dev`` to run the client or server independently.

#### Note on the Server
The server's API requires PostgreSQL to be installed and running on the developer's computer. Create an environment file in ``focal-server`` with
the proper connection settings for the server to work properly. You will get an uncaught exception if the port on the server is not configured.
You also must ensure the database URL and port is configured correctly, otherwise the script will thrown an exception as it cannot find and connect to a undefined URL and port.

Please see [DOTENV.md](docs/DOTENV.md) for further information on creating and understanding environment files.
