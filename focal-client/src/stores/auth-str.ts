/*
    auth-str.ts
    End for client to properly deal with tokens, and state management.
    TODO: have a centralized location for the navigation bar, because otherwise we need to keep writing 
    useAuthStore in the script tags everytime we want to login or logout.
*/

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import router from "../router/index"
import api from "../services/focal-api";

// This is our interface for our User token, the user_id will be a number under id, our email in a string, and our username also, in a string.
interface User {
    id: number;
    email: string;
    username: string;
}

// This creates a storage system we will use to store the token, properly set it and delete it when logging in and logging out.
export const useAuthStore = defineStore("auth", () => {
    const token = ref<string | null>(localStorage.getItem("focal-token"));
    const user = ref<User | null>(JSON.parse(localStorage.getItem("focal-user") || "null"));

    const isAuthenticated = computed(() => !!token.value);

    async function login(credentials: { email: string; password: string }) {
        try {
            const response = await api.post("/auth/login", credentials) // we don't need to specify the full API link, as the API handler does that for us
            token.value = response.data.token;
            user.value = response.data.user;

            localStorage.setItem("focal-token", token.value!);
            localStorage.setItem("focal-user", JSON.stringify(user.value));

            // We shouldn't need to do this, as Axios handles this dynamically.
            // api.defaults.headers.commmon["Authorization"] = `Bearer ${token.value}`;
        }
        catch (err: any) {
            console.log(err);
            throw err;
        }
    }

    function logout() {
        token.value = null;
        user.value = null;
        localStorage.removeItem("focal-token");
        localStorage.removeItem("focal-user");
        router.push("/login");
        // delete api.defaults.headers.commmon["Authorization"]
    }
    return { token, user, isAuthenticated, login, logout };
});