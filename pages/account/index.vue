<template>
  <div>
    <!-- Page heading -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Account Settings</h1>
      <p class="mt-1 text-sm text-gray-500">
        Manage your profile information and account preferences
      </p>
    </div>

    <div v-if="isLoading" class="py-12 text-center">
      <UIcon name="i-heroicons-arrow-path" class="mx-auto h-8 w-8 animate-spin text-gray-400" />
      <p class="mt-3 text-sm text-gray-500">Loading your account information...</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Profile Information -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium">Profile Information</h2>
            <UBadge v-if="user.verified" color="green" variant="subtle">
              Verified
            </UBadge>
            <UBadge v-else color="yellow" variant="subtle">
              Unverified
            </UBadge>
          </div>
        </template>

        <form @submit.prevent="updateProfile">
          <div class="space-y-4">
            <!-- Avatar -->
            <div class="flex items-center gap-4">
              <div class="relative">
                <UAvatar
                    v-if="avatarPreview || (user.avatar && avatarUrl)"
                    :src="avatarPreview || avatarUrl"
                    :alt="user.name || user.email"
                    size="xl"
                />
                <UAvatar
                    v-else
                    :alt="user.name || user.email"
                    size="xl"
                />

                <label class="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white">
                  <UIcon name="i-heroicons-camera" class="h-4 w-4" />
                  <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="onAvatarChange"
                  />
                </label>
              </div>

              <div v-if="avatarPreview || (user.avatar && avatarUrl)" class="flex-1">
                <UButton
                    color="red"
                    variant="ghost"
                    size="sm"
                    icon="i-heroicons-trash"
                    @click="removeAvatar"
                >
                  Remove
                </UButton>
              </div>
            </div>

            <!-- Name -->
            <UFormGroup label="Name" name="name">
              <UInput
                  v-model="profileForm.name"
                  placeholder="Your full name"
                  :error="profileErrors.name"
              />
            </UFormGroup>

            <!-- Email -->
            <UFormGroup label="Email Address" name="email">
              <UInput
                  v-model="profileForm.email"
                  type="email"
                  placeholder="your.email@example.com"
                  :error="profileErrors.email"
                  required
              />
              <template #help>
                <div v-if="!user.verified" class="text-xs text-yellow-600">
                  Your email is not verified. <a href="#" class="font-medium hover:underline" @click.prevent="sendVerification">Resend verification email</a>
                </div>
              </template>
            </UFormGroup>

            <!-- Actions -->
            <div class="flex justify-end pt-4">
              <UButton
                  type="submit"
                  color="primary"
                  :loading="isProfileUpdating"
              >
                Save Changes
              </UButton>
            </div>
          </div>
        </form>
      </UCard>

      <!-- Change Password -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-medium">Change Password</h2>
        </template>

        <form @submit.prevent="updatePassword">
          <div class="space-y-4">
            <!-- Current Password -->
            <UFormGroup label="Current Password" name="currentPassword">
              <UInput
                  v-model="passwordForm.currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  :error="passwordErrors.currentPassword"
                  required
              />
            </UFormGroup>

            <!-- New Password -->
            <UFormGroup label="New Password" name="password">
              <UInput
                  v-model="passwordForm.password"
                  type="password"
                  placeholder="Enter your new password"
                  :error="passwordErrors.password"
                  required
              />
              <template #help>
                <div class="text-xs text-gray-500">
                  Password must be at least 8 characters long
                </div>
              </template>
            </UFormGroup>

            <!-- Confirm New Password -->
            <UFormGroup label="Confirm New Password" name="passwordConfirm">
              <UInput
                  v-model="passwordForm.passwordConfirm"
                  type="password"
                  placeholder="Confirm your new password"
                  :error="passwordErrors.passwordConfirm"
                  required
              />
            </UFormGroup>

            <!-- Actions -->
            <div class="flex justify-end pt-4">
              <UButton
                  type="submit"
                  color="primary"
                  :loading="isPasswordUpdating"
              >
                Update Password
              </UButton>
            </div>
          </div>
        </form>
      </UCard>

      <!-- Privacy & Account Actions -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-medium">Account Actions</h2>
        </template>

        <div class="space-y-6">
          <div>
            <h3 class="text-base font-medium">Export Personal Data</h3>
            <p class="mt-1 text-sm text-gray-500">
              Download a copy of your personal information and content.
            </p>
            <UButton
                color="gray"
                class="mt-3"
                icon="i-heroicons-arrow-down-tray"
                @click="exportData"
            >
              Download Data
            </UButton>
          </div>

          <div class="border-t pt-6">
            <h3 class="text-base font-medium text-red-600">Delete Account</h3>
            <p class="mt-1 text-sm text-gray-500">
              Permanently delete your account and all your content. This action cannot be undone.
            </p>
            <UButton
                color="red"
                variant="ghost"
                class="mt-3"
                icon="i-heroicons-trash"
                @click="confirmDeleteAccount"
            >
              Delete Account
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

    <!-- Delete Account Confirmation Modal -->
    <UModal v-model="showDeleteModal">
      <div class="p-4 sm:p-6">
        <div class="text-center sm:text-left">
          <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto h-12 w-12 text-red-400 sm:mx-0" />
          <h3 class="mt-3 text-lg font-medium">Delete account</h3>
          <p class="mt-2 text-sm text-gray-500">
            Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.
          </p>

          <div class="mt-4">
            <UFormGroup label="Confirm by typing 'DELETE'" name="confirmDelete">
              <UInput
                  v-model="deleteConfirmation"
                  placeholder="Type DELETE to confirm"
              />
            </UFormGroup>
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-3 sm:mt-6">
          <UButton
              color="gray"
              @click="showDeleteModal = false"
          >
            Cancel
          </UButton>
          <UButton
              color="red"
              @click="deleteAccount"
              :loading="isDeleting"
              :disabled="deleteConfirmation !== 'DELETE'"
          >
            Delete Account
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Define page meta to apply auth middleware
definePageMeta({
  middleware: ['auth'],
  layout: 'account'
})

const authStore = useAuthStore()
const { $pb } = useNuxtApp()

// State
const isLoading = ref(true)
const user = ref({})
const avatarUrl = ref(null)
const avatarPreview = ref(null)
const newAvatarFile = ref(null)
const deleteAvatar = ref(false)

// Profile form state
const profileForm = ref({
  name: '',
  email: ''
})
const profileErrors = ref({})
const isProfileUpdating = ref(false)

// Password form state
const passwordForm = ref({
  currentPassword: '',
  password: '',
  passwordConfirm: ''
})
const passwordErrors = ref({})
const isPasswordUpdating = ref(false)

// Account deletion state
const showDeleteModal = ref(false)
const deleteConfirmation = ref('')
const isDeleting = ref(false)

// Success/error notification
const showSuccessAlert = ref(false)
const successMessage = ref('')

// Fetch user data
const fetchUserData = async () => {
  isLoading.value = true

  try {
    if (!authStore.isAuthenticated) return

    // Get user from auth store
    const userData = authStore.currentUser
    user.value = userData

    // Set form values
    profileForm.value.name = userData.name || ''
    profileForm.value.email = userData.email || ''

    // Get avatar URL if available
    if (userData.avatar) {
      avatarUrl.value = $pb.files.getUrl(userData, userData.avatar)
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
  } finally {
    isLoading.value = false
  }
}

// Handle avatar change
const onAvatarChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  newAvatarFile.value = file
  deleteAvatar.value = false

  // Create a preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Remove avatar
const removeAvatar = () => {
  avatarPreview.value = null
  newAvatarFile.value = null
  deleteAvatar.value = true
}

// Update profile
const updateProfile = async () => {
  profileErrors.value = {}

  // Validate email
  if (!profileForm.value.email) {
    profileErrors.value.email = 'Email is required'
    return
  }

  isProfileUpdating.value = true

  try {
    const formData = new FormData()

    // Add text fields
    formData.append('name', profileForm.value.name)
    formData.append('email', profileForm.value.email)

    // Handle avatar changes
    if (newAvatarFile.value) {
      formData.append('avatar', newAvatarFile.value)
    } else if (deleteAvatar.value) {
      formData.append('avatar', null)
    }

    // Update user
    const updatedUser = await $pb.collection('users').update(user.value.id, formData)

    // Update auth store
    authStore.setUser(updatedUser)

    // Update local user
    user.value = updatedUser

    // Reset avatar state
    newAvatarFile.value = null
    deleteAvatar.value = false

    // Show success message
    successMessage.value = 'Profile updated successfully'
    showSuccessAlert.value = true
    setTimeout(() => {
      showSuccessAlert.value = false
    }, 5000)

    // Update avatar URL if it changed
    if (updatedUser.avatar) {
      avatarUrl.value = $pb.files.getUrl(updatedUser, updatedUser.avatar)
      avatarPreview.value = null
    } else {
      avatarUrl.value = null
      avatarPreview.value = null
    }
  } catch (error) {
    console.error('Error updating profile:', error)

    if (error.response?.data?.email) {
      profileErrors.value.email = error.response.data.email.message
    } else {
      profileErrors.value.email = error.message
    }
  } finally {
    isProfileUpdating.value = false
  }
}

// Update password
const updatePassword = async () => {
  passwordErrors.value = {}

  // Validate password
  if (!passwordForm.value.currentPassword) {
    passwordErrors.value.currentPassword = 'Current password is required'
    return
  }

  if (!passwordForm.value.password) {
    passwordErrors.value.password = 'New password is required'
    return
  }

  if (passwordForm.value.password.length < 8) {
    passwordErrors.value.password = 'Password must be at least 8 characters long'
    return
  }

  if (passwordForm.value.password !== passwordForm.value.passwordConfirm) {
    passwordErrors.value.passwordConfirm = 'Passwords do not match'
    return
  }

  isPasswordUpdating.value = true

  try {
    // Verify current password before updating
    await $pb.collection('users').authWithPassword(
        user.value.email,
        passwordForm.value.currentPassword
    )

    // Update password
    await $pb.collection('users').update(user.value.id, {
      password: passwordForm.value.password,
      passwordConfirm: passwordForm.value.passwordConfirm
    })

    // Reset form
    passwordForm.value = {
      currentPassword: '',
      password: '',
      passwordConfirm: ''
    }

    // Show success message
    successMessage.value = 'Password updated successfully'
    showSuccessAlert.value = true
    setTimeout(() => {
      showSuccessAlert.value = false
    }, 5000)
  } catch (error) {
    console.error('Error updating password:', error)

    if (error.status === 400) {
      passwordErrors.value.currentPassword = 'Current password is incorrect'
    } else {
      passwordErrors.value.password = error.message
    }
  } finally {
    isPasswordUpdating.value = false
  }
}

// Send verification email
const sendVerification = async () => {
  try {
    await $pb.collection('users').requestVerification(user.value.email)

    // Show success message
    successMessage.value = 'Verification email sent. Please check your inbox.'
    showSuccessAlert.value = true
    setTimeout(() => {
      showSuccessAlert.value = false
    }, 5000)
  } catch (error) {
    console.error('Error sending verification email:', error)
  }
}

// Export data
const exportData = async () => {
  try {
    // In a real app, you would implement a proper data export
    // For now, just show a placeholder message
    const userData = {
      profile: user.value,
      content: await $pb.collection('content').getFullList({
        filter: `user = "${user.value.id}"`
      })
    }

    // Convert to JSON and download
    const dataStr = JSON.stringify(userData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportLink = document.createElement('a')
    exportLink.setAttribute('href', dataUri)
    exportLink.setAttribute('download', `user_data_${user.value.id}.json`)
    document.body.appendChild(exportLink)
    exportLink.click()
    document.body.removeChild(exportLink)

    // Show success message
    successMessage.value = 'Your data has been exported'
    showSuccessAlert.value = true
    setTimeout(() => {
      showSuccessAlert.value = false
    }, 5000)
  } catch (error) {
    console.error('Error exporting data:', error)
  }
}

// Confirm account deletion
const confirmDeleteAccount = () => {
  showDeleteModal.value = true
  deleteConfirmation.value = ''
}

// Delete account
const deleteAccount = async () => {
  if (deleteConfirmation.value !== 'DELETE') return

  isDeleting.value = true

  try {
    // Delete the user
    await $pb.collection('users').delete(user.value.id)

    // Log out
    await authStore.logout()

    // Redirect to home page
    navigateTo('/')
  } catch (error) {
    console.error('Error deleting account:', error)

    // Close modal and reset confirmation
    showDeleteModal.value = false
    deleteConfirmation.value = ''
  } finally {
    isDeleting.value = false
  }
}

// Initialize
onMounted(() => {
  fetchUserData()
})
</script>