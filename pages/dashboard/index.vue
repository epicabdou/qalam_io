<template>
  <div>
    <!-- Overview Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Content Count -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0 rounded-md bg-primary-50 p-3">
            <UIcon name="i-heroicons-document-text" class="h-6 w-6 text-primary" />
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-500">Total Content</div>
            <div class="mt-1 text-xl font-semibold">{{ contentStats.total || 0 }}</div>
          </div>
        </div>
      </UCard>

      <!-- Templates -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0 rounded-md bg-primary-50 p-3">
            <UIcon name="i-heroicons-template" class="h-6 w-6 text-primary" />
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-500">Templates</div>
            <div class="mt-1 text-xl font-semibold">{{ contentStats.templates || 0 }}</div>
          </div>
        </div>
      </UCard>

      <!-- This Week -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0 rounded-md bg-primary-50 p-3">
            <UIcon name="i-heroicons-clock" class="h-6 w-6 text-primary" />
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-500">This Week</div>
            <div class="mt-1 text-xl font-semibold">{{ contentStats.thisWeek || 0 }}</div>
          </div>
        </div>
      </UCard>

      <!-- Trending -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0 rounded-md bg-primary-50 p-3">
            <UIcon name="i-heroicons-chart-bar" class="h-6 w-6 text-primary" />
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-500">Trending</div>
            <div class="mt-1 flex items-center">
              <span class="text-xl font-semibold">{{ contentStats.trend || 0 }}%</span>
              <UIcon v-if="contentStats.trend > 0" name="i-heroicons-arrow-trending-up" class="ml-2 h-5 w-5 text-green-500" />
              <UIcon v-else name="i-heroicons-arrow-trending-down" class="ml-2 h-5 w-5 text-red-500" />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Main Content Area -->
    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Recent Content -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Recent Content</h3>
            <UButton to="/dashboard/content" color="primary" variant="ghost" size="xs">
              View All
            </UButton>
          </div>
        </template>

        <div v-if="recentContent.length === 0" class="py-10 text-center">
          <UIcon name="i-heroicons-document" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium">No content</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new content.</p>
          <div class="mt-6">
            <UButton to="/dashboard/content/new" color="primary">
              Create Content
            </UButton>
          </div>
        </div>

        <div v-else>
          <ul class="divide-y divide-gray-200">
            <li v-for="(item, index) in recentContent" :key="index" class="py-3">
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0 rounded-md bg-primary-50 p-2">
                  <UIcon name="i-heroicons-document-text" class="h-5 w-5 text-primary" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium">{{ item.title }}</p>
                  <p class="truncate text-sm text-gray-500">{{ formatDate(item.created) }}</p>
                </div>
                <div>
                  <UButton
                      color="gray"
                      variant="ghost"
                      icon="i-heroicons-pencil-square"
                      :to="`/dashboard/content/${item.id}`"
                      size="xs"
                  />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </UCard>

      <!-- Templates/Categories -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Templates</h3>
            <UButton to="/dashboard/templates" color="primary" variant="ghost" size="xs">
              View All
            </UButton>
          </div>
        </template>

        <div v-if="templates.length === 0" class="py-10 text-center">
          <UIcon name="i-heroicons-template" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium">No templates</h3>
          <p class="mt-1 text-sm text-gray-500">Templates will appear here.</p>
        </div>

        <div v-else>
          <ul class="divide-y divide-gray-200">
            <li
                v-for="(template, index) in templates"
                :key="index"
                class="flex items-center justify-between py-3"
            >
              <div class="flex items-center">
                <div class="flex-shrink-0 rounded-md bg-primary-50 p-2">
                  <UIcon
                      class="h-5 w-5 text-primary"
                      :name="{
                      'email': 'i-heroicons-envelope',
                      'social': 'i-heroicons-share',
                      'product': 'i-heroicons-shopping-bag',
                      'ad': 'i-heroicons-megaphone',
                    }[template.category] || 'i-heroicons-template'"
                  />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium">{{ template.name }}</p>
                  <p class="text-xs text-gray-500">{{
                      template.category
                          ? template.category.charAt(0).toUpperCase() + template.category.slice(1)
                          : 'No category'
                    }}</p>
                </div>
              </div>
              <UBadge color="primary" variant="subtle" size="xs">
                {{ template.useCount || 0 }} uses
              </UBadge>
            </li>
          </ul>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <div class="mt-6">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Quick Actions</h3>
        </template>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <UButton
              to="/dashboard/content/new"
              color="primary"
              block
              class="flex items-center justify-center gap-2 py-3"
          >
            <UIcon name="i-heroicons-plus" class="h-5 w-5" />
            <span>New Content</span>
          </UButton>

          <UButton
              to="/dashboard/templates"
              color="gray"
              block
              class="flex items-center justify-center gap-2 py-3"
          >
            <UIcon name="i-heroicons-template" class="h-5 w-5" />
            <span>Templates</span>
          </UButton>

          <UButton
              to="/account"
              color="gray"
              block
              class="flex items-center justify-center gap-2 py-3"
          >
            <UIcon name="i-heroicons-user-circle" class="h-5 w-5" />
            <span>Account</span>
          </UButton>

          <UButton
              color="gray"
              block
              class="flex items-center justify-center gap-2 py-3"
          >
            <UIcon name="i-heroicons-question-mark-circle" class="h-5 w-5" />
            <span>Help</span>
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Define page meta to use dashboard layout and auth middleware
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const authStore = useAuthStore()
const { $pb } = useNuxtApp()

// Data
const contentStats = ref({
  total: 0,
  templates: 0,
  thisWeek: 0,
  trend: 5 // Default value
})

const recentContent = ref([])
const templates = ref([])

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Fetch data on component mount
onMounted(async () => {
  if (!authStore.isAuthenticated) return

  try {
    // Fetch recent content
    const contentResults = await $pb.collection('content').getList(1, 5, {
      filter: `user = "${authStore.currentUser.id}"`,
      sort: '-created'
    })

    recentContent.value = contentResults.items || []

    // Get content stats
    contentStats.value.total = contentResults.totalItems

    // Calculate this week's content
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const thisWeekResults = await $pb.collection('content').getList(1, 1, {
      filter: `user = "${authStore.currentUser.id}" && created >= "${oneWeekAgo.toISOString()}"`,
      countOnly: true
    })

    contentStats.value.thisWeek = thisWeekResults.totalItems

    // Fetch templates
    const templateResults = await $pb.collection('templates').getList(1, 5, {
      sort: 'name'
    })

    templates.value = templateResults.items || []
    contentStats.value.templates = templateResults.totalItems

    // Add a use count to templates (in a real app, this would be a proper relation/count)
    templates.value = templates.value.map(template => ({
      ...template,
      useCount: Math.floor(Math.random() * 10) // Simulate usage count for demo
    }))

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
})
</script>