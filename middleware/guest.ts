// middleware/guest.js
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
    // If running on the server, we can't check the auth state,
    // so we will validate on client side after hydration
    if (process.server) return

    const authStore = useAuthStore()
    const { $pb } = useNuxtApp()

    // If the user is already authenticated and trying to access login page
    if (authStore.isAuthenticated) {
        // Redirect to dashboard or home page
        return navigateTo('/')
    }
})