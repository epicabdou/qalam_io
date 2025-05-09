// middleware/auth.js
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
    // If running on the server, we can't check the auth state,
    // so we will validate on client side after hydration
    if (process.server) return

    const authStore = useAuthStore()
    const { $pb } = useNuxtApp()

    // If not authenticated and the route requires authentication
    if (!authStore.isAuthenticated) {
        // Store the intended destination for redirect after login
        sessionStorage.setItem('redirectPath', to.fullPath)

        // Redirect to login
        return navigateTo('/auth/login')
    }
})