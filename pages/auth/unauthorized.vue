<!-- pages/unauthorized.vue -->
<template>
  <div>
    <div>
      <div>
        <div>🔐</div>
      </div>

      <h1>Access Denied</h1>

      <div>
        <p>
          You don't have permission to access this page.
        </p>
        <p>
          This area is restricted to administrators only.
        </p>
      </div>

      <div>
        <button @click="goToHome">
          Go to Home
        </button>
        <button v-if="isLoggedIn" @click="logout">
          Logout
        </button>
      </div>

      <div>
        <p>
          If you believe this is an error, please contact your system administrator or
          <a href="#">request access</a>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth.js'
import { useRoute } from 'vue-router'

useSeoMeta({
  title: 'Ajimall | Unauthorized',
  ogTitle: 'Ajimall | Unauthorized',
  description: 'This is my amazing site, let me tell you all about it.',
  ogDescription: 'This is my amazing site, let me tell you all about it.',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
})

const route = useRoute()
const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isAuthenticated)

const goToHome = () => {
  navigateTo('/')
}

const logout = () => {
  authStore.logout()
}
</script>