<!-- components/Navbar.vue -->
<template>
  <div class="border-b">
    <UContainer>
      <nav class="py-4">
        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center justify-between">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-primary">MyApp</h1>
          </div>
          <div>
            <ul class="flex items-center gap-4">
              <li>
                <NuxtLink to="/" active-class="text-primary font-medium">
                  Home
                </NuxtLink>
              </li>
              <li v-if="!authStore.isAuthenticated">
                <NuxtLink to="/auth/login" active-class="text-primary font-medium">
                  Login
                </NuxtLink>
              </li>
              <li v-if="!authStore.isAuthenticated">
                <UButton
                    to="/auth/register"
                    color="primary"
                >
                  Register
                </UButton>
              </li>
              <li v-if="authStore.isAuthenticated" class="ml-2">
                <UDropdownMenu
                    :items="[
                      { label: 'My Profile', icon: 'i-heroicons-user-circle', to: '/account' },
                      { label: 'Dashboard', icon: 'i-heroicons-chart-bar', to: '/dashboard' },
                      { label: 'Templates', icon: 'i-heroicons-template', to: '/dashboard/templates', disabled: !authStore.isAdmin },
                      { label: 'Logout', icon: 'i-heroicons-arrow-right-on-rectangle', onClick: logout }
                    ]"
                    :popper="{ placement: 'bottom-end' }"
                >
                  <div class="flex items-center gap-2 cursor-pointer">
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
                    <span class="text-sm font-medium">{{ authStore.currentUser?.name || 'User' }}</span>
                    <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
                  </div>
                </UDropdownMenu>
              </li>
            </ul>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div class="flex md:hidden items-center justify-between">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-primary">MyApp</h1>
          </div>
          <div class="flex items-center gap-2">
            <UAvatar
                v-if="authStore.isAuthenticated && authStore.currentUser?.avatar"
                :src="getUserAvatarUrl(authStore.currentUser)"
                :alt="authStore.currentUser?.name || 'User'"
                size="xs"
                class="mr-1"
            />
            <UDropdownMenu
                :items="[
                  { label: 'Home', icon: 'i-heroicons-home', to: '/' },
                  { label: 'Account', icon: 'i-heroicons-user-circle', to: '/account', disabled: !authStore.isAuthenticated },
                  { label: 'Dashboard', icon: 'i-heroicons-chart-bar', to: '/dashboard', disabled: !authStore.isAdmin },
                  { label: 'Logout', icon: 'i-heroicons-arrow-right-on-rectangle', onClick: logout, disabled: !authStore.isAuthenticated },
                  { label: 'Login', icon: 'i-heroicons-arrow-left-on-rectangle', to: '/auth/login', disabled: authStore.isAuthenticated },
                  { label: 'Register', icon: 'i-heroicons-user-plus', to: '/auth/register', disabled: authStore.isAuthenticated }
                ]"
                :popper="{ placement: 'bottom-end' }"
            >
              <UButton color="primary" variant="ghost" icon="i-heroicons-bars-3" />
            </UDropdownMenu>
          </div>
        </div>
      </nav>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();

const logout = async () => {
  console.log('Logout button clicked');
  try {
    await authStore.logout();
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// Function to get user avatar URL
const getUserAvatarUrl = (user) => {
  if (!user || !user.avatar) return null;

  // If using PocketBase
  const { $pb } = useNuxtApp();
  if ($pb && user.collectionId && user.id) {
    return $pb.files.getURL(user, user.avatar);
  }

  // Or just return the avatar URL directly
  return user.avatar;
};
</script>