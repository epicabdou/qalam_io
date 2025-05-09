// plugins/pocketbase.js
import PocketBase from 'pocketbase'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
    const config = useRuntimeConfig()

    // Initialize PocketBase
    const pb = new PocketBase(config.public.pocketbaseUrl)

    // Get the auth store
    const authStore = useAuthStore()

    // Set up OAuth redirect URLs
    const baseUrl = window.location.origin
    pb.autoCancellation(false) // Disable auto cancellation for OAuth requests

    // Config for OAuth
    const authMethods = {
        google: {
            name: 'google',
            // The callback URL should match what you've configured in PocketBase admin UI
            // and your OAuth provider (Google Cloud Console)
            callbackUrl: `${baseUrl}/auth/callback`
        }
    }

    // Check if we have a valid session on page load
    if (pb.authStore.isValid) {
        // Set the auth state in our Pinia store
        authStore.setUser(pb.authStore.record)
        authStore.setLoggedIn(true)

        // ADDED: Check if we're not on the callback page but auth is valid
        // This helps with initial page load after authentication
        const currentPath = window.location.pathname
        if (currentPath === '/auth/login' || currentPath === '/auth/register') {
            // If we're authenticated but on login/register page, redirect to home
            navigateTo('/')
        }
    }

    // IMPROVED: Auth store change listener to handle redirect after auth changes
    pb.authStore.onChange((token, model) => {
        authStore.setUser(model || null)
        authStore.setLoggedIn(pb.authStore.isValid)

        // If authentication changed and we're now logged in
        // and we're on a login-related page, redirect to home
        if (pb.authStore.isValid) {
            const currentPath = window.location.pathname
            if (currentPath === '/auth/login' || currentPath === '/auth/register') {
                navigateTo('/')
            }
        }
    })

    // Make PocketBase and auth methods available globally
    nuxtApp.provide('pb', pb)
    nuxtApp.provide('authMethods', authMethods)
})