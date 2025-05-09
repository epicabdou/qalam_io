<!-- pages/auth/callback.vue -->
<template>
  <div class="oauth-callback">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Achèvement de l’authentification...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth.js'

useSeoMeta({
  title: 'Ajimall | Callback',
  ogTitle: 'Ajimall | Callback',
  description: 'This is my amazing site, let me tell you all about it.',
  ogDescription: 'This is my amazing site, let me tell you all about it.',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
})

const authStore = useAuthStore()
const { $pb } = useNuxtApp()

onMounted(async () => {
  try {
    // Add some debugging
    console.log('Auth callback mounted')
    console.log('PB auth valid:', $pb.authStore.isValid)
    console.log('Redirect path:', sessionStorage.getItem('redirectPath'))

    // When redirected back from OAuth provider
    if ($pb.authStore.isValid) {
      // Update auth store
      authStore.setUser($pb.authStore.record)
      authStore.setLoggedIn(true)

      // Verify auth store updated correctly
      console.log('Auth store updated, isAuthenticated:', authStore.isAuthenticated)

      // Get redirection path with fallback
      const redirectPath = sessionStorage.getItem('redirectPath') || '/'
      console.log('Redirecting to:', redirectPath)

      // Use await to ensure navigation completes
      await navigateTo(redirectPath)

      sessionStorage.removeItem('redirectPath')

      location.reload();

    } else {
      // Authentication failed
      console.log('Auth failed, redirecting to login')
      navigateTo('/login?error=oauth_failed')
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    navigateTo('/login?error=oauth_failed')
  }
})

</script>

<style scoped>
.oauth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.loading-container {
  text-align: center;
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>