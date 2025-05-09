// middleware/admin.js
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
    // If running on the server, we can't check the auth state,
    // so we will validate on client side after hydration
    if (process.server) return

    const authStore = useAuthStore()
    const { $pb } = useNuxtApp()

    // First check if the user is authenticated at all
    if (!authStore.isAuthenticated) {
        // Store the intended destination for redirect after login
        sessionStorage.setItem('redirectPath', to.fullPath)

        // Redirect to login
        return navigateTo('/auth/login')
    }

    // Then check if the authenticated user is an admin
    if (!$pb.authStore.model.isAdmin) {
        // User is authenticated but not an admin
        // Redirect to unauthorized page or dashboard
        return navigateTo({
            path: '/auth/unauthorized',
            query: { redirect: to.fullPath }
        })
    }
})