/*
    focal-api.ts
    Creates a basic API Instance for use in connecting the Node/Express backend with the VueJS frontend.
*/

import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => { // We intercept any outgoing HTTP requests and add our token in localStorage if we have it.
    const token = localStorage.getItem("focal-token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response, // if everything is good, we move on
    (error) => {
        if (error.response && error.response.status === 401) { // otherwise, we end up here. go back and login for me.
            localStorage.removeItem("focal-token");
            localStorage.removeItem("focal-user");
            window.location.href = "/login";
        }
        return Promise.reject(error)
    }
)

export default api;