<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen">
    <Navbar />
    <UContainer class="py-8">
      <slot />
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import Navbar from "~/components/Navbar.vue";
</script>