<template>
  <div class="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-primary">Connexion</h1>
        <p class="mt-2 text-sm">
          Connectez-vous à votre compte
        </p>
      </div>

      <UCard class="mt-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <UFormGroup label="E-mail" name="email">
            <UInput
                v-model="email"
                type="email"
                required
                placeholder="Entrez votre e-mail"
                :ui="{ base: 'w-full' }"
            />
          </UFormGroup>

          <UFormGroup label="Mot de Passe" name="password">
            <UInput
                v-model="password"
                type="password"
                required
                placeholder="Entrez votre mot de passe"
                :ui="{ base: 'w-full' }"
            />
          </UFormGroup>

          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <UIcon name="i-heroicons-exclamation-circle" class="h-5 w-5 text-red-400" />
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>

          <UButton
              type="submit"
              color="primary"
              block
              :loading="isLoading"
              :disabled="isLoading"
          >
            {{ isLoading ? 'Connexion en cours...' : 'Connexion' }}
          </UButton>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-white px-2 text-gray-500">OU</span>
            </div>
          </div>

          <div class="mt-6">
            <UButton
                color="gray"
                variant="outline"
                block
                @click="handleGoogleAuth"
                :loading="isLoading"
                :disabled="isLoading"
            >
              <template #leading>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                </svg>
              </template>
              Se connecter avec Google
            </UButton>
          </div>
        </div>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Vous n'avez pas de compte ?
            <NuxtLink to="/auth/register" class="font-medium text-primary hover:text-primary-dark">
              S'inscrire
            </NuxtLink>
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Apply guest middleware to prevent logged-in users from accessing this page
definePageMeta({
  middleware: ['guest']
})

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const authStore = useAuthStore()
const { $pb } = useNuxtApp()

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    // Authenticate with PocketBase
    const authData = await $pb.collection('users').authWithPassword(email.value, password.value)

    // Update auth store
    authStore.setUser(authData.record)
    authStore.setLoggedIn(true)

    // Get redirect path or use default
    const redirectPath = sessionStorage.getItem('redirectPath') || '/'
    sessionStorage.removeItem('redirectPath')

    // Navigate to destination
    navigateTo(redirectPath)
  } catch (err) {
    console.error('Erreur de connexion :', err)
    error.value = err.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.'
  } finally {
    isLoading.value = false
  }
}

const handleGoogleAuth = async () => {
  error.value = ''
  isLoading.value = true

  try {
    // Save the intended redirect destination in sessionStorage
    const redirectPath = sessionStorage.getItem('redirectPath') || '/'
    console.log('Setting redirectPath for after OAuth:', redirectPath)
    sessionStorage.setItem('redirectPath', redirectPath)

    // Define the callback URL
    const redirectUrl = window.location.origin + '/auth/callback'
    console.log('OAuth callback URL:', redirectUrl)

    // Start the OAuth flow with Google
    await $pb.collection('users').authWithOAuth2({
      provider: 'google',
      scopes: ['email', 'profile'],
      redirectUrl: redirectUrl
    })

    // Note: The code below won't execute immediately as the browser will redirect
  } catch (err) {
    console.error('Erreur d\'authentification Google :', err)
    error.value = err.message || 'Échec de la connexion avec Google. Veuillez réessayer.'
    isLoading.value = false
  }
}
</script>