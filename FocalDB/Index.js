import postgres from 'postgres';

// Running checklist,
// Make sure node.js is installed
// in a command prompt, "npm install postgres"
// cd "wherever/this/file/islocated"
// node index.js


// Server Information, may need to change port or other
// characteristics if applicable
const sql = postgres({
    host: 'localhost',
    port: 5433,
    database: 'FocalDB',
    username: 'postgres',
// password: '',
});

// Returns all information in user_login table
async function getUsers() {
    try {
        return await sql`SELECT * FROM user_login ORDER BY user_id DESC`;
    } catch (error) {
        console.error('Get users error:', error);
    }
}

// Will delete user and EVERYTHING ATTACHED TO IT'S ID
async function deleteUser(id) {
    try {
        const [user] = await sql`
            DELETE FROM user_login
            WHERE user_id = ${id}
            RETURNING *
        `;

        return user;
    } catch (error) {
        console.error('Could not delete user:', error);
    }
}


// Returns all user information in user_login
async function getUserById(id) {
    try {
        const [user] = await sql`
            SELECT * FROM user_login
            WHERE user_id = ${id}
        `;

        return user;
    } catch (error) {
        console.error('Get user error:', error);
    }
}

async function main() {
    try {

        const users = await getUsers();
        console.log('All users:', users);

        const user = await getUserById(1);
        console.log('Found user:', user);

    } finally {
        await sql.end();
    }
}

main().catch(console.error);
