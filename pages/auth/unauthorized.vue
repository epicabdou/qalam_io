<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
      <div class="text-center mb-6">
        <div class="bg-red-100 text-red-600 p-3 rounded-full inline-flex text-3xl mb-4">
          <UIcon name="i-heroicons-lock-closed" class="h-8 w-8" />
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>

        <div class="text-gray-600 mb-6">
          <p class="mb-2">
            You don't have permission to access this page.
          </p>
          <p>
            This area is restricted to administrators only.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <UButton color="gray" @click="goToHome">
            Go to Home
          </UButton>
          <UButton v-if="isLoggedIn" color="primary" variant="ghost" @click="logout">
            Logout
          </UButton>
        </div>

        <div class="mt-6 text-sm text-gray-500">
          <p>
            If you believe this is an error, please contact your system administrator or
            <a href="#" class="text-primary hover:underline">request access</a>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

useSeoMeta({
  title: 'MyApp | Unauthorized',
  description: 'Access denied - Administrator privileges required'
})

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isAuthenticated)

const goToHome = () => {
  navigateTo('/')
}

const logout = () => {
  authStore.logout()
}
</script>