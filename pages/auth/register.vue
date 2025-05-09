<template>
  <div>
    <div>
      <h1>Créer un Compte</h1>

      <form @submit.prevent="handleRegister">
        <div>
          <label for="email">E-mail</label>
          <div>
            <input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="Entrez votre e-mail"
            />
          </div>
        </div>

        <div>
          <label for="password">Mot de Passe</label>
          <div>
            <input
                id="password"
                v-model="password"
                type="password"
                required
                placeholder="Entrez votre mot de passe" minlength="8"
            />
          </div>
          <p>Le mot de passe doit comporter au moins 8 caractères</p>
        </div>

        <div>
          <label for="passwordConfirm">Confirmer le Mot de Passe</label>
          <div>
            <input
                id="passwordConfirm"
                v-model="passwordConfirm"
                type="password"
                required
                placeholder="Confirmez votre mot de passe"
            />
          </div>
          <p v-if="passwordConfirm.length > 0 && password !== passwordConfirm">
            Les mots de passe ne correspondent pas
          </p>
        </div>

        <div v-if="error">
          {{ error }}
        </div>

        <button type="submit" :disabled="isLoading || !isPasswordValid">
          <span v-if="isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isLoading ? 'Création du compte...' : 'S\'inscrire' }}
        </button>
      </form>

      <p>
        Vous avez déjà un compte ?
        <NuxtLink to="/auth/login">Se connecter</NuxtLink>
      </p>

      <div>
        <p>
          En vous inscrivant, vous acceptez nos
          <a href="#">Conditions Générales d'Utilisation</a> et
          <a href="#">Politique de Confidentialité</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth.ts'

// Appliquer le middleware invité pour empêcher les utilisateurs connectés d'accéder à cette page // MODIFIED
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

  // Valider que les mots de passe correspondent // MODIFIED
  if (password.value !== passwordConfirm.value) {
    // MODIFIED
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  isLoading.value = true

  try {
    // Créer l'utilisateur // MODIFIED
    const userData = {
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
      // You might want to add a default name or other fields here
      // name: "New User"
    }

    // Inscrire le nouvel utilisateur // MODIFIED
    const newUser = await $pb.collection('users').create(userData)

    // Connexion automatique après l'inscription // MODIFIED
    const authData = await $pb.collection('users').authWithPassword(
        email.value,
        password.value
    )

    // Mettre à jour le store d'authentification // MODIFIED
    authStore.setUser(authData.record)
    authStore.setLoggedIn(true)

    // Naviguer vers // MODIFIED (Navigate to home page after successful registration)
    navigateTo('/')
  } catch (err) {
    // MODIFIED
    console.error('Erreur d\'inscription :', err)
    // MODIFIED
    error.value = err.message || 'Échec de l\'inscription. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>