<template>
  <div>
    <!-- Header with Actions -->
    <div class="mb-6 flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
      <div>
        <div class="flex items-center">
          <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-left"
              to="/dashboard/content"
              class="mr-2"
          />
          <h1 class="text-xl font-bold truncate max-w-md">
            {{ content ? content.title : 'Content Details' }}
          </h1>
        </div>
        <p v-if="content" class="mt-1 text-sm text-gray-500">
          Created {{ formatDate(content.created) }}
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
            v-if="content"
            color="gray"
            variant="outline"
            icon="i-heroicons-pencil-square"
            :to="`/dashboard/content/${contentId}/edit`"
        >
          Edit
        </UButton>
        <UButton
            v-if="content"
            color="primary"
            icon="i-heroicons-document-duplicate"
            @click="copyContent"
        >
          {{ copySuccess ? 'Copied!' : 'Copy' }}
        </UButton>
      </div>
    </div>

    <div v-if="isLoading" class="py-12 text-center">
      <UIcon name="i-heroicons-arrow-path" class="mx-auto h-8 w-8 animate-spin text-gray-400" />
      <p class="mt-3 text-sm text-gray-500">Loading content...</p>
    </div>

    <div v-else-if="!content" class="py-12 text-center">
      <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto h-12 w-12 text-amber-400" />
      <h3 class="mt-2 text-sm font-medium">Content not found</h3>
      <p class="mt-1 text-sm text-gray-500">
        The content you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <div class="mt-6">
        <UButton to="/dashboard/content" color="primary">
          Back to Content List
        </UButton>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Content Display -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Content</h3>
            <div class="flex gap-2">
              <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-document-duplicate"
                  size="xs"
                  @click="copyContentText"
              >
                {{ copyContentSuccess ? 'Copied!' : 'Copy Text' }}
              </UButton>
            </div>
          </div>
        </template>

        <div class="prose max-w-none">
          <div class="whitespace-pre-wrap">{{ content.content }}</div>
        </div>
      </UCard>

      <!-- Metadata -->
      <div class="space-y-6">
        <!-- Basic Info -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">Information</h3>
          </template>

          <div class="space-y-4">
            <div>
              <h4 class="text-sm font-medium text-gray-500">Title</h4>
              <p class="mt-1">{{ content.title }}</p>
            </div>

            <div v-if="content.expand && content.expand.template">
              <h4 class="text-sm font-medium text-gray-500">Template</h4>
              <div class="mt-1 flex items-center">
                <UIcon
                    class="mr-1 h-4 w-4 text-primary"
                    :name="{
                    'email': 'i-heroicons-envelope',
                    'social': 'i-heroicons-share',
                    'product': 'i-heroicons-shopping-bag',
                    'ad': 'i-heroicons-megaphone',
                  }[content.expand.template.category] || 'i-heroicons-template'"
                />
                <NuxtLink
                    :to="`/dashboard/templates/${content.template}`"
                    class="text-primary hover:underline"
                >
                  {{ content.expand.template.name }}
                </NuxtLink>
              </div>
            </div>

            <div v-if="content.tags">
              <h4 class="text-sm font-medium text-gray-500">Tags</h4>
              <div class="mt-1 flex flex-wrap gap-1">
                <UBadge
                    v-for="(tag, index) in parseTags(content.tags)"
                    :key="index"
                    color="primary"
                    variant="subtle"
                    size="sm"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-500">Created</h4>
              <p class="mt-1 text-sm">{{ formatDate(content.created) }}</p>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-500">Last Updated</h4>
              <p class="mt-1 text-sm">{{ formatDate(content.updated) }}</p>
            </div>
          </div>
        </UCard>

        <!-- Template Parameters Used -->
        <UCard v-if="content.parameters_used && Object.keys(content.parameters_used).length > 0">
          <template #header>
            <h3 class="text-lg font-medium">Template Parameters Used</h3>
          </template>

          <div class="divide-y divide-gray-200">
            <div
                v-for="(value, key) in content.parameters_used"
                :key="key"
                class="py-3"
            >
              <h4 class="text-sm font-medium text-gray-500">{{ formatParameterKey(key) }}</h4>
              <p class="mt-1 text-sm truncate">{{ value }}</p>
            </div>
          </div>
        </UCard>

        <!-- Actions -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">Actions</h3>
          </template>

          <div class="flex flex-col gap-3">
            <UButton
                color="primary"
                icon="i-heroicons-pencil-square"
                block
                :to="`/dashboard/content/${contentId}/edit`"
            >
              Edit Content
            </UButton>

            <UButton
                color="gray"
                icon="i-heroicons-document-duplicate"
                block
                @click="duplicateContent"
            >
              Duplicate
            </UButton>

            <UButton
                color="red"
                icon="i-heroicons-trash"
                block
                variant="ghost"
                @click="confirmDelete"
            >
              Delete
            </UButton>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteModal">
      <div class="p-4 sm:p-6">
        <div class="text-center sm:text-left">
          <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto h-12 w-12 text-red-400 sm:mx-0" />
          <h3 class="mt-3 text-lg font-medium">Delete content</h3>
          <p class="mt-2 text-sm text-gray-500">
            Are you sure you want to delete this content? This action cannot be undone.
          </p>
        </div>
        <div class="mt-4 flex justify-end gap-3 sm:mt-6">
          <UButton
              color="gray"
              @click="showDeleteModal = false"
          >
            Cancel
          </UButton>
          <UButton
              color="red"
              @click="deleteContent"
              :loading="isDeleting"
          >
            Delete
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth.ts'
import { useRoute, useRouter } from 'vue-router'

// Define page meta to use dashboard layout and auth middleware
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const authStore = useAuthStore()
const { $pb } = useNuxtApp()
const route = useRoute()
const router = useRouter()

// Get the content ID from the route
const contentId = computed(() => route.params.id)

// State
const content = ref(null)
const isLoading = ref(true)
const copySuccess = ref(false)
const copyContentSuccess = ref(false)
const showDeleteModal = ref(false)
const isDeleting = ref(false)

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Parse tags helper
const parseTags = (tags) => {
  if (!tags) return []
  return tags.split(',').map(tag => tag.trim()).filter(tag => tag)
}

// Format parameter key helper
const formatParameterKey = (key) => {
  if (!key) return ''

  // Convert camelCase or snake_case to Title Case
  return key
      .replace(/([A-Z])/g, ' $1') // Space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
      .trim()
}

// Copy content to clipboard
const copyContent = async () => {
  if (!content.value) return

  try {
    await navigator.clipboard.writeText(JSON.stringify(content.value, null, 2))
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Error copying content:', error)
    // You could add error handling/toast here
  }
}

// Copy content text only
const copyContentText = async () => {
  if (!content.value || !content.value.content) return

  try {
    await navigator.clipboard.writeText(content.value.content)
    copyContentSuccess.value = true
    setTimeout(() => {
      copyContentSuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Error copying content text:', error)
    // You could add error handling/toast here
  }
}

// Confirm delete
const confirmDelete = () => {
  showDeleteModal.value = true
}

// Delete content
const deleteContent = async () => {
  if (!content.value) return

  isDeleting.value = true

  try {
    await $pb.collection('content').delete(contentId.value)

    // Close modal
    showDeleteModal.value = false

    // Redirect to content list
    router.push('/dashboard/content')

    // Show success message
    // You could add a toast notification here
  } catch (error) {
    console.error('Error deleting content:', error)
    // Show error message
  } finally {
    isDeleting.value = false
  }
}

// Duplicate content
const duplicateContent = async () => {
  if (!content.value) return

  try {
    // Create a copy without ID and timestamps
    const { id, created, updated, ...contentToDuplicate } = content.value

    // Update title to indicate it's a copy
    contentToDuplicate.title = `${contentToDuplicate.title} (Copy)`

    // Create new record
    const newContent = await $pb.collection('content').create(contentToDuplicate)

    // Navigate to the new content
    router.push(`/dashboard/content/${newContent.id}`)

    // Show success message
    // You could add a toast notification here
  } catch (error) {
    console.error('Error duplicating content:', error)
    // Show error message
  }
}

// Fetch content
const fetchContent = async () => {
  isLoading.value = true

  try {
    content.value = await $pb.collection('content').getOne(contentId.value, {
      expand: 'template'
    })

    // Check if user has permission to view this content
    if (content.value.user !== authStore.currentUser.id) {
      content.value = null
    }
  } catch (error) {
    console.error('Error fetching content:', error)
    content.value = null
  } finally {
    isLoading.value = false
  }
}

// Initialize
onMounted(async () => {
  if (!authStore.isAuthenticated) return

  await fetchContent()
})
</script>