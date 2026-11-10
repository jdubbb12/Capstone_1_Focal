# Generating Environment File

Creating an environment file is simple and allows for development to be portable and secure. Node natively supports environment files
and this makes configuration of specific systems easier, as you may have a different database port, or different database URL you would like to use while developing Focal.

Before running, ensure your proper environment settings are set. In ``focal-server/``, create a ``.env`` file with variables for
the port number for the server, the database port number, the URL used to access the database, and the secret for your JSON Web Token. 
Any environment variables used in the code should be fully capitalized, such as ``DATABASE_URL``, as to signal this is a predefined variable and will not change in the code.

**DO NOT UPLOAD THIS FILE ONTO THE REPOSITORY!** 

It's generally not good practice to upload Environment files as these are specific to you, and your development. ``.env`` files have an entry in the ``.gitignore`` folder as to prevent any unintentional uploading of this file.

## Example

```
# Comments on a .env file look like this.
# To put in variables for the server to find and use,  
# type in a variable name and its value.  
  
PORT=1234
DATABASE_PORT=5678
VERY_SECURE_SECRET="Totally Secure Secret"
IMPORTANT_URL="http://test.com"
ANOTHER_VARIABLE=flowers_are_very_nice

```
More examples can be found online, and information on how Node uses the ``.env`` file can be found in [Node's documentation.](https://nodejs.org/api/environment_variables.html)