<template>
  <div class="mb-6 overflow-x-auto">
    <UButtonGroup class="w-full sm:w-auto">
      <UButton
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :color="isActive(item.to) ? 'primary' : 'gray'"
          :variant="isActive(item.to) ? 'solid' : 'ghost'"
          class="whitespace-nowrap"
      >
        <UIcon :name="item.icon" class="mr-1 h-4 w-4" />
        {{ item.label }}
      </UButton>
    </UButtonGroup>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// Navigation items
const navItems = [
  {
    label: 'Profile',
    to: '/account',
    icon: 'i-heroicons-user-circle'
  },
  {
    label: 'Security',
    to: '/account/security',
    icon: 'i-heroicons-shield-check'
  },
  {
    label: 'Notifications',
    to: '/account/notifications',
    icon: 'i-heroicons-bell'
  },
  {
    label: 'Billing',
    to: '/account/billing',
    icon: 'i-heroicons-credit-card'
  }
]

// Check if the current route is active
const isActive = (path) => {
  return route.path === path
}
</script>