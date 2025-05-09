// stores/preferences.js
import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', {
    state: () => ({
        // Notification preferences
        notifications: {
            email: {
                enabled: true,
                frequency: 'daily',
                categories: {
                    accountUpdates: true,
                    newContent: true,
                    marketing: false,
                    systemAlerts: true
                }
            },
            inApp: {
                enabled: true,
                categories: {
                    accountUpdates: true,
                    newContent: true,
                    marketing: false,
                    systemAlerts: true
                }
            }
        },

        // UI preferences
        ui: {
            theme: 'light',
            fontSize: 'medium',
            reducedMotion: false,
            compactView: false
        },

        // Content preferences
        content: {
            defaultTemplate: null,
            showTutorials: true,
            recentSearches: []
        }
    }),

    getters: {
        // Email notification getters
        isEmailEnabled: (state) => state.notifications.email.enabled,
        emailFrequency: (state) => state.notifications.email.frequency,

        // In-app notification getters
        isInAppEnabled: (state) => state.notifications.inApp.enabled,

        // UI getters
        currentTheme: (state) => state.ui.theme,

        // Combined preferences for profile
        profilePreferences: (state) => ({
            notifications: state.notifications,
            ui: state.ui,
            content: state.content
        })
    },

    actions: {
        // Load user preferences from PocketBase
        async loadPreferences() {
            const { $pb } = useNuxtApp()
            const authStore = useAuthStore()

            try {
                if (!authStore.isAuthenticated || !$pb.authStore.model) {
                    return
                }

                // In a real app, you would store user preferences in a separate collection
                // For this demo, we'll assume preferences are stored in a 'preferences' field on the user
                const user = $pb.authStore.model

                if (user.preferences) {
                    // Parse preferences if stored as a JSON string
                    const preferences = typeof user.preferences === 'string'
                        ? JSON.parse(user.preferences)
                        : user.preferences

                    // Update store state with saved preferences
                    if (preferences.notifications) {
                        this.notifications = { ...this.notifications, ...preferences.notifications }
                    }

                    if (preferences.ui) {
                        this.ui = { ...this.ui, ...preferences.ui }
                    }

                    if (preferences.content) {
                        this.content = { ...this.content, ...preferences.content }
                    }
                }

                // Apply theme if needed
                this.applyTheme()
            } catch (error) {
                console.error('Error loading preferences:', error)
            }
        },

        // Save user preferences to PocketBase
        async savePreferences() {
            const { $pb } = useNuxtApp()
            const authStore = useAuthStore()

            try {
                if (!authStore.isAuthenticated || !$pb.authStore.model) {
                    return false
                }

                // Get user ID
                const userId = $pb.authStore.model.id

                // Update the user's preferences
                await $pb.collection('users').update(userId, {
                    preferences: JSON.stringify({
                        notifications: this.notifications,
                        ui: this.ui,
                        content: this.content
                    })
                })

                return true
            } catch (error) {
                console.error('Error saving preferences:', error)
                return false
            }
        },

        // Toggle email notifications
        toggleEmailNotifications(enabled) {
            this.notifications.email.enabled = enabled
            return this.savePreferences()
        },

        // Set email frequency
        setEmailFrequency(frequency) {
            this.notifications.email.frequency = frequency
            return this.savePreferences()
        },

        // Toggle in-app notifications
        toggleInAppNotifications(enabled) {
            this.notifications.inApp.enabled = enabled
            return this.savePreferences()
        },

        // Update category preference
        updateCategoryPreference(type, category, enabled) {
            if (this.notifications[type] && this.notifications[type].categories) {
                this.notifications[type].categories[category] = enabled
                return this.savePreferences()
            }
            return false
        },

        // Set theme (light/dark)
        setTheme(theme) {
            this.ui.theme = theme
            this.applyTheme()
            return this.savePreferences()
        },

        // Toggle between light and dark theme
        toggleTheme() {
            this.ui.theme = this.ui.theme === 'light' ? 'dark' : 'light'
            this.applyTheme()
            return this.savePreferences()
        },

        // Apply current theme to the document
        applyTheme() {
            // Implementation depends on your theme system
            // This is a basic example
            if (this.ui.theme === 'dark') {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        },

        // Reset preferences to defaults
        resetPreferences() {
            const defaultState = {
                notifications: {
                    email: {
                        enabled: true,
                        frequency: 'daily',
                        categories: {
                            accountUpdates: true,
                            newContent: true,
                            marketing: false,
                            systemAlerts: true
                        }
                    },
                    inApp: {
                        enabled: true,
                        categories: {
                            accountUpdates: true,
                            newContent: true,
                            marketing: false,
                            systemAlerts: true
                        }
                    }
                },
                ui: {
                    theme: 'light',
                    fontSize: 'medium',
                    reducedMotion: false,
                    compactView: false
                },
                content: {
                    defaultTemplate: null,
                    showTutorials: true,
                    recentSearches: []
                }
            }

            this.$patch(defaultState)
            this.applyTheme()
            return this.savePreferences()
        }
    }
})

// Import auth store
import { useAuthStore } from './auth'
import { useNuxtApp } from 'nuxt/app'