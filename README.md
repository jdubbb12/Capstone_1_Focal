### Capstone 1: Focal

This branch is a test for Sprint 1 to determine the proper frameworks
for the client ends of the web app, and the server sided ends of the web app.
**This is not final!** Please expect things to change as development continues
and other group members chime in with ideas. - Diego

## Justifications
For this web app, web technologies are non-negotiable. Node.js for the server end likely
makes our development easier by keeping our coding all in one language. Now, as for using
JavaScript and [TypeScript](https://www.typescriptlang.org/), I'm not entirely sure, though I'm leaning twords using TS as it
avoids notorious issues with types in JavaScript.

As for the client side, I chose [Vue](https://vuejs.org/) with TS for this branch. React is the typical choice
in these scenarios, but it is far more involved and heavier, and much different from
typical web standards, which isn't bad, but as I have little web experience, I chose something
simple.

The 3D element of this is what I am most torn about, there are really, only two projects that are
worth investigating. Babylon functions more like a game engine, and it's far more involved, which means
less 3D coding at the cost of weight and less popular, as compared to Three.js which is far more known,
but requires more effort and in-depth 3D coding.

Last thing, is the actual desktop app aspect, really the only framework I'm aware of is Electron,
used in things such as Discord, etc. Though, at the moment I'm not too concerned with that.

## Database
The database we will be using is PostgreSQL as some in our team have had experience with 
Postgres and are familiar with how to create our database and the proper practices that go along with creating it.

At the moment, we are simply running the database on our local machines and running a text file with SQL commands
located in the main branch. In the future, we should move to a unified solution or a containerized solution, such as
with Docker. But, until that is discussed, we will be using this method for our development.

## Setup

For now, this is a extremely basic template file. If you wish to run this for development purposes, ensure
you have [Node.js](https://nodejs.org/en/download) installed with NPM. Then, after installing Node, clone this repository and enter the repository folder.
At the root, run ``npm install``. This will install dependencies for the entire project. Then, enter the ``focal-client`` folder
and run ``npm install`` again. You will repeat this process for ``focal-server`` as well. This will likely be made into a script,
but for now, this will be enough.

#### Environment File
Before running, ensure your proper environment settings are set. In focal-server, create a ``.env`` folder with variables for
the port number for the server, the database port number, the URL used to access the database, and the secret for your JSON Web Token.

**DO NOT UPLOAD THIS FILE ONTO THE REPOSITORY!** 

It's generally not a good practice to upload Environment files as these are specific to you, and your development. It
has an entry in the ``.gitignore`` to avoid conflicts and potential security issues further along. If you need more help with this, contact Diego.

### Initialization
Then to run, simply run ``npm run dev`` at the root of the repository directory. You will get an error, ignore that for now,
as there is no server logic to run. You can connect to the rudimentary client end using the IP address printed in the terminal.


You can begin modifying client files in ``focal-client`` if you wish.
