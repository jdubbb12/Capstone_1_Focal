### Capstone 1: Focal

<<<<<<< Updated upstream
This is a basic README to ensure a proper function of Git and GitHub.
=======
This branch is a test for Sprint 1 to determine the proper frameworks
for the client ends of the web app, and the server sided ends of the web app.
**This is not final!** Please expect things to change as development continues
and other group members chime in with ideas. - Diego

## Backend setup

The Express/TypeScript/PostgreSQL backend now has working account/session,
profile, and interest APIs plus a versioned application schema.
See [the backend runbook](docs/BACKEND_SETUP.md) for Windows setup, database
isolation, endpoint usage, tests, and the explicit list of features still pending.
The API contract is in [docs/openapi.json](docs/openapi.json).

## Justifications
For this web app, web technologies are non-negotiable. Node.js for the server end likely
makes our development easier by keeping our coding all in one language. Now, as for using
JavaScript and TypeScript, I'm not entirely sure, though I'm leaning twords using TS as it
avoids notorious issues with types in JavaScript.

As for the client side, I chose Vue with TS for this branch. React is the typical choice
in these scenarios, but it is far more involved and heavier, and much different from
typical web standards, which isn't bad, but as I have little web experience, I chose something
simple.

The 3D element of this is what I am most torn about, there are really, only two projects that are
worth investigating. Babylon functions more like a game engine, and it's far more involved, which means
less 3D coding at the cost of weight and less popular, as compared to Three.js which is far more known,
but requires more effort and in-depth 3D coding.

Last thing, is the actual desktop app aspect, really the only framework I'm aware of is Electron,
used in things such as Discord, etc. Though, at the moment I'm not too concerned with that.

## Starting

For now, this is a extremely basic template file. If you wish to run this for development purposes, ensure
you have Node.js installed with NPM. Then, after installing Node, clone this repository and enter the repository folder.
At the root, run ``npm install``. This will install dependencies for the entire project. Then, enter the ``focal-client`` folder
and run ``npm install`` again. You will repeat this process for ``focal-server`` as well. This will likely be made into a script,
but for now, this will be enough.

Before running the full project, follow the backend runbook to start PostgreSQL and apply migrations.
Then run ``npm run dev`` at the root of the repository directory to launch both the API and the Vue client.
Open http://localhost:5173. Signup, login, logout, profile/account editing, and user interests are connected.
See [frontend integration](docs/FRONTEND_INTEGRATION.md) for the combined run commands and browser tests; artwork, boards, and annotation screens remain labeled previews.

You can begin modifying client files in ``focal-client`` if you wish.
>>>>>>> Stashed changes
