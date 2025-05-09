<template>
  <div>
    <!-- Page heading -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Notification Settings</h1>
      <p class="mt-1 text-sm text-gray-500">
        Manage how and when you receive notifications
      </p>
    </div>

    <div class="space-y-6">
      <!-- Email Notifications -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium">Email Notifications</h2>
            <UToggle
                v-model="emailEnabled"
                :on-icon="{ icon: 'i-heroicons-check', class: 'text-white' }"
                :off-icon="{ icon: 'i-heroicons-x-mark', class: 'text-gray-400' }"
            />
          </div>
        </template>

        <div v-if="!emailEnabled" class="py-6 text-center">
          <UIcon name="i-heroicons-bell-slash" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium">Email notifications are disabled</h3>
          <p class="mt-1 text-sm text-gray-500">
            Enable email notifications to customize your preferences.
          </p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="(category, index) in notificationCategories" :key="index" class="flex items-center justify-between py-2">
            <div>
              <h3 class="text-sm font-medium">{{ category.title }}</h3>
              <p class="text-sm text-gray-500">{{ category.description }}</p>
            </div>
            <UToggle
                v-model="category.enabled"
                :on-icon="{ icon: 'i-heroicons-check', class: 'text-white' }"
                :off-icon="{ icon: 'i-heroicons-x-mark', class: 'text-gray-400' }"
            />
          </div>

          <div class="mt-4 border-t pt-4">
            <h3 class="text-sm font-medium">Email Frequency</h3>
            <p class="text-sm text-gray-500">How often you'd like to receive notification emails.</p>
            <div class="mt-2">
              <URadio v-model="emailFrequency" value="realtime" name="frequency" label="Real-time" />
              <URadio v-model="emailFrequency" value="daily" name="frequency" label="Daily digest" />
              <URadio v-model="emailFrequency" value="weekly" name="frequency" label="Weekly digest" />
            </div>
          </div>
        </div>
      </UCard>

      <!-- In-App Notifications -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium">In-App Notifications</h2>
            <UToggle
                v-model="inAppEnabled"
                :on-icon="{ icon: 'i-heroicons-check', class: 'text-white' }"
                :off-icon="{ icon: 'i-heroicons-x-mark', class: 'text-gray-400' }"
            />
          </div>
        </template>

        <div v-if="!inAppEnabled" class="py-6 text-center">
          <UIcon name="i-heroicons-bell-slash" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium">In-app notifications are disabled</h3>
          <p class="mt-1 text-sm text-gray-500">
            Enable in-app notifications to customize your preferences.
          </p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="(category, index) in notificationCategories" :key="index" class="flex items-center justify-between py-2">
            <div>
              <h3 class="text-sm font-medium">{{ category.title }}</h3>
              <p class="text-sm text-gray-500">{{ category.description }}</p>
            </div>
            <UToggle
                v-model="category.inAppEnabled"
                :on-icon="{ icon: 'i-heroicons-check', class: 'text-white' }"
                :off-icon="{ icon: 'i-heroicons-x-mark', class: 'text-gray-400' }"
            />
          </div>
        </div>
      </UCard>

      <!-- Push Notifications -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-medium">Push Notifications</h2>
        </template>

        <div class="py-4">
          <p class="text-sm text-gray-500">
            Push notifications are not yet available. Stay tuned for updates!
          </p>
          <div class="mt-4">
            <UButton
                color="primary"
                variant="outline"
                disabled
            >
              Enable Push Notifications (Coming Soon)
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Save Changes -->
      <div class="flex justify-end">
        <UButton
            color="primary"
            :loading="isSaving"
            @click="saveSettings"
        >
          Save Preferences
        </UButton>
      </div>
    </div>

    <!-- Success Alert -->
    <UAlert
        v-if="showSuccessAlert"
        color="green"
        variant="soft"
        icon="i-heroicons-check-circle"
        title="Success"
        class="mb-4 mt-6"
    >
      {{ successMessage }}
    </UAlert>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Define page meta to apply auth middleware and account layout
definePageMeta({
  middleware: ['auth'],
  layout: 'account'
})

const authStore = useAuthStore()
const { $pb } = useNuxtApp()

// State
const emailEnabled = ref(true)
const inAppEnabled = ref(true)
const emailFrequency = ref('daily')
const isSaving = ref(false)

// Success/error notification
const showSuccessAlert = ref(false)
const successMessage = ref('')

// Notification categories
const notificationCategories = ref([
  {
    title: 'Account Updates',
    description: 'Notifications about your account, security, and privacy.',
    enabled: true,
    inAppEnabled: true
  },
  {
    title: 'New Content',
    description: 'Notifications about new templates and features.',
    enabled: true,
    inAppEnabled: true
  },
  {
    title: 'Marketing & Promotions',
    description: 'Offers, promotions, and news about our products.',
    enabled: false,
    inAppEnabled: false
  },
  {
    title: 'System Alerts',
    description: 'Important alerts about system updates and maintenance.',
    enabled: true,
    inAppEnabled: true
  }
])

// Save notification settings
const saveSettings = async () => {
  isSaving.value = true

  // In a real app, you would send these settings to your backend
  // For now, we'll just simulate a success response
  try {
    // Simulate API call with timeout
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update user record with notification preferences
    const user = authStore.currentUser
    if (user) {
      const notificationSettings = {
        emailEnabled: emailEnabled.value,
        inAppEnabled: inAppEnabled.value,
        emailFrequency: emailFrequency.value,
        categories: notificationCategories.value.map(cat => ({
          title: cat.title,
          enabled: cat.enabled,
          inAppEnabled: cat.inAppEnabled
        }))
      }

      // In a real app, you would store these settings in your database
      console.log('Saving notification settings:', notificationSettings)

      // Show success message
      successMessage.value = 'Notification preferences saved successfully'
      showSuccessAlert.value = true
      setTimeout(() => {
        showSuccessAlert.value = false
      }, 5000)
    }
  } catch (error) {
    console.error('Error saving notification settings:', error)
  } finally {
    isSaving.value = false
  }
}

// Load user notification settings
const loadSettings = async () => {
  // In a real app, you would load the user's notification settings
  // For now, we'll just use the default values
}

// Initialize
onMounted(() => {
  loadSettings()
})
</script>