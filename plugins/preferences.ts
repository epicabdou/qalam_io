// plugins/preferences.js
import { usePreferencesStore } from '~/stores/preferences'

export default defineNuxtPlugin(async () => {
    const preferencesStore = usePreferencesStore()

    // Load preferences when auth state changes
    const { $pb } = useNuxtApp()

    // Check if we have an auth state on load
    if ($pb.authStore.isValid) {
        await preferencesStore.loadPreferences()
    }

    // Add listener for auth changes
    $pb.authStore.onChange(async () => {
        if ($pb.authStore.isValid) {
            await preferencesStore.loadPreferences()
        }
    })
})