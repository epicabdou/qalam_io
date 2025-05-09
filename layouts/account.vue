<template>
  <div class="min-h-screen">
    <Navbar />

    <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <AccountNavigation />
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue'
import AccountNavigation from '~/components/AccountNavigation.vue'
</script>