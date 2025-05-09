// stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isLoggedIn: false,
        isLoading: false
    }),

    getters: {
        isAuthenticated: (state) => state.isLoggedIn && state.user !== null,
        currentUser: (state) => state.user,
        // Explicitly check for isAdmin flag to enforce permissions
        isAdmin: (state) => state.user && state.user.isAdmin === true
    },

    actions: {
        setUser(user) {
            this.user = user
        },

        setLoggedIn(status) {
            this.isLoggedIn = status
        },

        setLoading(status) {
            this.isLoading = status
        },

        clearUser() {
            this.user = null
            this.isLoggedIn = false
        },

        async logout() {
            const { $pb } = useNuxtApp()
            $pb.authStore.clear()
            this.clearUser()

            // Navigate to login page
            navigateTo('/')
        }
    }
})