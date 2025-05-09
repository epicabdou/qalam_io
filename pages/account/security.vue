<template>
  <div>
    <!-- Page heading -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Security Settings</h1>
      <p class="mt-1 text-sm text-gray-500">
        Manage your account security and active sessions
      </p>
    </div>

    <div class="space-y-6">
      <!-- Account Security -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-medium">Account Security</h2>
        </template>

        <div class="space-y-4">
          <!-- Password Strength -->
          <div>
            <h3 class="text-sm font-medium text-gray-500">Password Strength</h3>
            <div class="mt-2">
              <div class="h-2 w-full rounded-full bg-gray-200">
                <div
                    class="h-2 rounded-full bg-green-500"
                    :class="{
                    'w-1/4 bg-red-500': passwordStrength === 'weak',
                    'w-2/4 bg-yellow-500': passwordStrength === 'medium',
                    'w-3/4 bg-blue-500': passwordStrength === 'good',
                    'w-full bg-green-500': passwordStrength === 'strong'
                  }"
                ></div>
              </div>
              <p class="mt-1 text-sm" :class="{
                'text-red-500': passwordStrength === 'weak',
                'text-yellow-500': passwordStrength === 'medium',
                'text-blue-500': passwordStrength === 'good',
                'text-green-500': passwordStrength === 'strong'
              }">
                {{
                  passwordStrength === 'weak' ? 'Weak password' :
                      passwordStrength === 'medium' ? 'Medium password' :
                          passwordStrength === 'good' ? 'Good password' :
                              'Strong password'
                }}
              </p>
            </div>
            <div class="mt-2">
              <UButton
                  color="primary"
                  variant="ghost"
                  size="sm"
                  to="/account"
              >
                Change Password
              </UButton>
            </div>
          </div>

          <!-- Two-Factor Authentication -->
          <div class="border-t pt-4">
            <h3 class="text-sm font-medium text-gray-500">Two-Factor Authentication</h3>
            <p class="mt-1 text-sm text-gray-500">
              Add an extra layer of security to your account by requiring a verification code in addition to your password.
            </p>
            <div class="mt-2">
              <UButton
                  color="primary"
                  variant="outline"
                  size="sm"
                  disabled
              >
                Set Up 2FA (Coming Soon)
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Active Sessions -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium">Active Sessions</h2>
            <UBadge color="primary" size="sm">{{ authOrigins.length }}</UBadge>
          </div>
        </template>

        <div v-if="isSessionsLoading" class="py-8 text-center">
          <UIcon name="i-heroicons-arrow-path" class="mx-auto h-6 w-6 animate-spin text-gray-400" />
          <p class="mt-2 text-sm text-gray-500">Loading sessions...</p>
        </div>

        <div v-else-if="authOrigins.length === 0" class="py-8 text-center">
          <UIcon name="i-heroicons-computer-desktop" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium">No active sessions</h3>
          <p class="mt-1 text-sm text-gray-500">
            You don't have any active sessions at the moment.
          </p>
        </div>

        <div v-else>
          <ul class="divide-y divide-gray-200">
            <li v-for="(session, index) in authOrigins" :key="index" class="py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
                    <UIcon
                        :name="getDeviceIcon(session)"
                        class="h-5 w-5 text-primary"
                    />
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium">{{ getDeviceName(session) }}</p>
                    <p class="text-xs text-gray-500">
                      {{ getLocationInfo(session) }}
                    </p>
                    <p class="text-xs text-gray-500">
                      Last active: {{ formatDate(session.updated) }}
                    </p>
                  </div>
                </div>
                <div>
                  <UBadge v-if="isCurrentSession(session)" color="green" variant="subtle" size="sm">
                    Current
                  </UBadge>
                  <UButton
                      v-else
                      color="red"
                      variant="ghost"
                      size="xs"
                      icon="i-heroicons-x-mark"
                      @click="revokeSession(session)"
                  >
                    Revoke
                  </UButton>
                </div>
              </div>
            </li>
          </ul>

          <div class="mt-4 flex justify-end border-t pt-4">
            <UButton
                color="red"
                variant="ghost"
                size="sm"
                @click="confirmRevokeAll"
            >
              Revoke All Other Sessions
            </UButton>
          </div>
        </div>
      </UCard>
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

    <!-- Revoke All Sessions Confirmation Modal -->
    <UModal v-model="showRevokeModal">
      <div class="p-4 sm:p-6">
        <div class="text-center sm:text-left">
          <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto h-12 w-12 text-red-400 sm:mx-0" />
          <h3 class="mt-3 text-lg font-medium">Revoke all other sessions</h3>
          <p class="mt-2 text-sm text-gray-500">
            Are you sure you want to revoke all other active sessions? This will log you out from all other devices.
          </p>
        </div>

        <div class="mt-4 flex justify-end gap-3 sm:mt-6">
          <UButton
              color="gray"
              @click="showRevokeModal = false"
          >
            Cancel
          </UButton>
          <UButton
              color="red"
              @click="revokeAllSessions"
              :loading="isRevoking"
          >
            Revoke All
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Define page meta to apply auth middleware and account layout
definePageMeta({
  middleware: ['auth'],
  layout: 'account'
})

const authStore = useAuthStore()
const { $pb } = useNuxtApp()

// State
const passwordStrength = ref('medium') // This would be calculated in a real app
const authOrigins = ref([])
const isSessionsLoading = ref(true)
const showRevokeModal = ref(false)
const isRevoking = ref(false)

// Success/error notification
const showSuccessAlert = ref(false)
const successMessage = ref('')

// Get current device information
const currentFingerprint = ref('')

// Fetch auth origins (sessions)
const fetchAuthOrigins = async () => {
  isSessionsLoading.value = true

  try {
    // Get current user
    const user = authStore.currentUser
    if (!user) return

    // Get auth origins for this user
    const records = await $pb.collection('_authOrigins').getFullList({
      filter: `recordRef = "${user.id}" && collectionRef = "${user.collectionId}"`,
      sort: '-updated'
    })

    authOrigins.value = records

    // Get current session fingerprint
    currentFingerprint.value = $pb.authStore.fingerprint
  } catch (error) {
    console.error('Error fetching auth origins:', error)
    authOrigins.value = []
  } finally {
    isSessionsLoading.value = false
  }
}

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)

  // If today, show time only
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // If yesterday, show "Yesterday"
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Otherwise show date and time
  return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Get device name from fingerprint
const getDeviceName = (session) => {
  const fingerprint = session.fingerprint || ''

  if (fingerprint.includes('Windows')) return 'Windows Device'
  if (fingerprint.includes('Macintosh')) return 'Mac Device'
  if (fingerprint.includes('iPhone')) return 'iPhone'
  if (fingerprint.includes('iPad')) return 'iPad'
  if (fingerprint.includes('Android')) return 'Android Device'
  if (fingerprint.includes('Linux')) return 'Linux Device'

  return 'Unknown Device'
}

// Get device icon
const getDeviceIcon = (session) => {
  const fingerprint = session.fingerprint || ''

  if (fingerprint.includes('iPhone') || fingerprint.includes('iPad') || fingerprint.includes('Android')) {
    return 'i-heroicons-device-phone-mobile'
  }

  return 'i-heroicons-computer-desktop'
}

// Get location info
const getLocationInfo = (session) => {
  // In a real app, you would parse the IP and get location
  // This is just a placeholder
  return 'Location information not available'
}

// Check if this is the current session
const isCurrentSession = (session) => {
  return session.fingerprint === currentFingerprint.value
}

// Revoke a specific session
const revokeSession = async (session) => {
  try {
    await $pb.collection('_authOrigins').delete(session.id)

    // Remove from list
    authOrigins.value = authOrigins.value.filter(s => s.id !== session.id)

    // Show success message
    successMessage.value = 'Session revoked successfully'
    showSuccessAlert.value = true
    setTimeout(() => {
      showSuccessAlert.value = false
    }, 5000)
  } catch (error) {
    console.error('Error revoking session:', error)
  }
}

// Confirm revoke all sessions
const confirmRevokeAll = () => {
  showRevokeModal.value = true
}

// Revoke all sessions except current
const revokeAllSessions = async () => {
  isRevoking.value = true

  try {
    // Get all sessions except current
    const sessionsToRevoke = authOrigins.value.filter(s => !isCurrentSession(s))

    // Delete each session
    for (const session of sessionsToRevoke) {
      await $pb.collection('_authOrigins').delete(session.id)
    }

    // Update list to show only current session
    authOrigins.value = authOrigins.value.filter(s => isCurrentSession(s))

    // Close modal
    showRevokeModal.value = false

    // Show success message
    successMessage.value = 'All other sessions revoked successfully'
    showSuccessAlert.value = true
    setTimeout(() => {
      showSuccessAlert.value = false
    }, 5000)
  } catch (error) {
    console.error('Error revoking all sessions:', error)
  } finally {
    isRevoking.value = false
  }
}

// Initialize
onMounted(() => {
  fetchAuthOrigins()
})
</script>