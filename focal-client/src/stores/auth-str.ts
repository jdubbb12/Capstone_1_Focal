/*
    auth-str.ts
    End for client to properly deal with tokens, and state management.
*/

import { defineStore } from "pinia";
import { ref, computed } from "vue"; // recovered from illness enough to actually push - Diego :)
import api from "../services/focal-api";

interface User {
    id: number;
    email: string;
    username: string;
}

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
        // delete api.defaults.headers.commmon["Authorization"]
    }
    return { token, user, isAuthenticated, login, logout };
});