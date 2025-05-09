<template>
  <div class="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-primary">Créer un Compte</h1>
        <p class="mt-2 text-sm">
          Inscrivez-vous pour utiliser notre service
        </p>
      </div>

      <UCard class="mt-8">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <UFormGroup label="E-mail" name="email">
            <UInput
                v-model="email"
                type="email"
                required
                placeholder="Entrez votre e-mail"
                :ui="{ base: 'w-full' }"
            />
          </UFormGroup>

          <UFormGroup label="Mot de Passe" name="password" help="Le mot de passe doit comporter au moins 8 caractères">
            <UInput
                v-model="password"
                type="password"
                required
                placeholder="Entrez votre mot de passe"
                minlength="8"
                :ui="{ base: 'w-full' }"
            />
          </UFormGroup>

          <UFormGroup label="Confirmer le Mot de Passe" name="passwordConfirm">
            <UInput
                v-model="passwordConfirm"
                type="password"
                required
                placeholder="Confirmez votre mot de passe"
                :ui="{ base: 'w-full' }"
            />
            <template #help>
              <p v-if="passwordConfirm.length > 0 && password !== passwordConfirm" class="text-red-500">
                Les mots de passe ne correspondent pas
              </p>
            </template>
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
              :disabled="isLoading || !isPasswordValid"
          >
            {{ isLoading ? 'Création du compte...' : 'S\'inscrire' }}
          </UButton>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Vous avez déjà un compte ?
            <NuxtLink to="/auth/login" class="font-medium text-primary hover:text-primary-dark">
              Se connecter
            </NuxtLink>
          </p>
        </div>

        <div class="mt-6 text-xs text-gray-500">
          <p>
            En vous inscrivant, vous acceptez nos
            <a href="#" class="font-medium text-primary hover:text-primary-dark">Conditions Générales d'Utilisation</a> et
            <a href="#" class="font-medium text-primary hover:text-primary-dark">Politique de Confidentialité</a>
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Apply guest middleware to prevent logged-in users from accessing this page
definePageMeta({
  middleware: ['guest']
})

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const error = ref('')
const isLoading = ref(false)

const authStore = useAuthStore()
const { $pb } = useNuxtApp()

const isPasswordValid = computed(() => {
  return password.value.length >= 8 && password.value === passwordConfirm.value
})

const handleRegister = async () => {
  error.value = ''

  // Validate password match
  if (password.value !== passwordConfirm.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  isLoading.value = true

  try {
    // Create new user
    const userData = {
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value
    }

    // Register the new user
    const newUser = await $pb.collection('users').create(userData)

    // Auto-login after registration
    const authData = await $pb.collection('users').authWithPassword(
        email.value,
        password.value
    )

    // Update auth store
    authStore.setUser(authData.record)
    authStore.setLoggedIn(true)

    // Navigate to home page after successful registration
    navigateTo('/')
  } catch (err) {
    console.error('Erreur d\'inscription :', err)
    error.value = err.message || 'Échec de l\'inscription. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>