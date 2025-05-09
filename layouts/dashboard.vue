<!-- layouts/dashboard.vue -->
<template>
  <div class="min-h-screen">
    <!-- Mobile sidebar backdrop -->
    <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-20 transition-opacity md:hidden"
        @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <div
        :class="[
        'fixed inset-y-0 left-0 z-30 w-64 transform overflow-y-auto transition-all',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0 md:shadow-md'
      ]"
    >
      <!-- Sidebar header -->
      <div class="flex h-16 items-center justify-between border-b px-6">
        <NuxtLink to="/" class="flex items-center gap-2">
          <h1 class="text-xl font-bold text-primary">MyApp</h1>
        </NuxtLink>
        <UButton
            color="primary"
            variant="ghost"
            icon="i-heroicons-x-mark"
            size="sm"
            class="md:hidden"
            @click="sidebarOpen = false"
        />
      </div>

      <!-- Sidebar content -->
      <nav class="mt-4 px-4">
        <div class="space-y-1">
          <!-- Dashboard -->
          <NuxtLink
              to="/dashboard"
              class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
              :class="route.path === '/dashboard' ? 'bg-primary' : ''"
          >
            <UIcon name="i-heroicons-home" class="h-5 w-5" />
            <span>Dashboard</span>
          </NuxtLink>

          <!-- Content -->
          <NuxtLink
              to="/dashboard/content"
              class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
              :class="route.path.includes('/dashboard/content') ? 'bg-primary' : ''"
          >
            <UIcon name="i-heroicons-document-text" class="h-5 w-5" />
            <span>Content</span>
          </NuxtLink>

          <!-- Templates -->
          <NuxtLink
              to="/dashboard/templates"
              class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
              :class="route.path.includes('/dashboard/templates') ? 'bg-primary' : ''"
          >
            <UIcon name="i-heroicons-bookmark" class="h-5 w-5" />
            <span>Templates</span>
          </NuxtLink>

          <!-- Settings -->
          <NuxtLink
              to="/account"
              class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
              :class="route.path.includes('/account') ? 'bg-primary' : ''"
          >
            <UIcon name="i-heroicons-cog-6-tooth" class="h-5 w-5" />
            <span>Settings</span>
          </NuxtLink>
        </div>

        <!-- User section at bottom -->
        <div class="mt-10 border-t pt-4">
          <div class="flex items-center gap-3 px-3 py-2">
            <UAvatar
                v-if="authStore.currentUser?.avatar"
                :src="getUserAvatarUrl(authStore.currentUser)"
                :alt="authStore.currentUser?.name || 'User'"
                size="sm"
            />
            <UAvatar
                v-else
                :alt="authStore.currentUser?.name || 'User'"
                size="sm"
            />
            <div class="flex-1 truncate">
              <div class="text-sm font-medium">
                {{ authStore.currentUser?.name || authStore.currentUser?.email || 'User' }}
              </div>
              <div class="truncate text-xs">
                {{ authStore.currentUser?.email }}
              </div>
            </div>
            <UDropdownMenu
                :items="[
                { label: 'My Profile', icon: 'i-heroicons-user-circle', to: '/account' },
                { label: 'Logout', icon: 'i-heroicons-arrow-right-on-rectangle', onClick: logout }
              ]"
                :popper="{ placement: 'top-end' }"
            >
              <UButton color="primary" variant="ghost" icon="i-heroicons-ellipsis-vertical" />
            </UDropdownMenu>
          </div>
        </div>
      </nav>
    </div>

    <!-- Main content -->
    <div class="md:pl-64">
      <!-- Top navbar -->
      <div class="sticky top-0 z-10 flex h-16 shadow">
        <UButton
            color="primary"
            variant="ghost"
            icon="i-heroicons-bars-3"
            class="md:hidden"
            @click="sidebarOpen = true"
        />

        <div class="flex flex-1 items-center justify-between px-4 md:px-6">
          <div>
            <h2 class="text-xl font-semibold">{{ pageTitle }}</h2>
          </div>

          <div class="flex items-center gap-3">
            <!-- Notifications -->
            <UButton
                color="primary"
                variant="ghost"
                icon="i-heroicons-bell"
                class="relative"
            >
              <div class="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500"></div>
            </UButton>

            <!-- Help -->
            <UButton
                color="primary"
                variant="ghost"
                icon="i-heroicons-question-mark-circle"
            />
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main class="p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const sidebarOpen = ref(false)

// Dynamic page title based on route
const pageTitle = computed(() => {
  if (route.path === '/dashboard') return 'Dashboard'
  if (route.path.includes('/dashboard/content')) return 'Content Management'
  if (route.path.includes('/dashboard/templates')) return 'Templates'
  if (route.path.includes('/account')) return 'Account Settings'
  return 'Dashboard'
})

// Logout function from auth store
const logout = async () => {
  try {
    await authStore.logout()
    console.log('Logout successful')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Function to get user avatar URL
const getUserAvatarUrl = (user) => {
  if (!user || !user.avatar) return null

  // If using PocketBase
  const { $pb } = useNuxtApp()
  if ($pb && user.collectionId && user.id) {
    return $pb.files.getURL(user, user.avatar)
  }

  // Or just return the avatar URL directly
  return user.avatar
}
</script>