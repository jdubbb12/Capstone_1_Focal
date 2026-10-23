<script setup lang="ts">
import {ref} from 'vue';
/*

    (THE SCRIPT TAG AND IMPORT TAG MUST BE AT THE TOP OF THE FILE, OTHERWISE IT IS RENDERED INCORRECTLY)
    login.vue - Diego V.
    The authentication checks, but on the client end.
    TODO: proper testing and validation.

*/


// This is kinda ugly, but it's essentially declaring variables we are using and their type,
// we must use ref from the Vue library as it allows for reactivity, otherwise it would be a static
// HTML page.
const isSignedUp = ref(false);
const email = ref('');
const username = ref('');
const password = ref('');
const errorMsg = ref('');
const successMsg = ref('');

// Checks if the user is signed up or not, otherwise switches mode and resets the page.
const switchMode = () => {
    isSignedUp.value = !isSignedUp.value
    errorMsg.value = "";
    successMsg.value = "";
}

const cliSubmission = async() => {
    errorMsg.value = "";
    successMsg.value = "";

    // Ternary operator to switch to the proper API endpoint to either signup or login to the system.
    const srvEndpoint = isSignedUp.value ? 
    'http://localhost:3000/api/auth/signup' :
    'http://localhost:3000/api/auth/login';

    // Similar case here, except we are changing the object we are sending to the server based on what we want to do.
    const cliPayload = isSignedUp.value ? 
    {email: email.value, username: username.value, password: password.value} :
    {email: email.value, password: password.value};

    try {
        // This is how the client expects the response from the server to match, if it doesn't match, it will reject this and throw an error.
        const srvReponse = await fetch(srvEndpoint, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(cliPayload)
        });

        // This interacts with our auth logic in focal-server/src/routes/auth.ts, it's basically waiting for the server to send over the JSON
        // with our user info and session token.
        const srvData = await srvReponse.json();

        if (!srvReponse.ok) {
            // Sorry, wrong info!
            throw new Error(srvData.error || "Authentication Failed");
        }

        // Sets our token from the server into LocalStorage, you can verify this using the developer console.
        localStorage.setItem('client-credentials', srvData.token)
        successMsg.value = "Successful Login"; // TEMPORARY: Would redirect to the homepage, but for now, this will print a simple success message.
    }
    catch(error: any) {
        // The server sends back an object with an internal error message displayed.
        errorMsg.value = error.message;
    }
};

</script>

<template>
  <h1>MISSING PROPER TEMPLATE</h1>
  <p>
    This page is missing the proper login/signup tempalte. 
    The logic has had extremely basic testing on my end (Diego's)
    But, I could not get the login page working at the moment.
    Sorry!
  </p>
</template>