<template>
  <div>
    <!-- Header with Actions -->
    <div class="mb-6 flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
      <div>
        <h1 class="text-xl font-bold">Content Management</h1>
        <p class="mt-1 text-sm text-gray-500">
          Manage your generated content
        </p>
      </div>
      <div class="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
        <UButton
            color="primary"
            to="/dashboard/content/new"
            icon="i-heroicons-plus"
        >
          New Content
        </UButton>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-6">
      <div class="sm:col-span-4">
        <UInput
            v-model="filters.search"
            placeholder="Search by title or tags..."
            icon="i-heroicons-magnifying-glass"
            class="w-full"
        />
      </div>
      <div class="sm:col-span-2">
        <USelect
            v-model="filters.template"
            :options="templateOptions"
            placeholder="Filter by template"
            class="w-full"
        />
      </div>
    </div>

    <!-- Content Table -->
    <UCard>
      <div v-if="isLoading" class="py-12 text-center">
        <UIcon name="i-heroicons-arrow-path" class="mx-auto h-8 w-8 animate-spin text-gray-400" />
        <p class="mt-3 text-sm text-gray-500">Loading your content...</p>
      </div>

      <div v-else-if="contents.length === 0" class="py-12 text-center">
        <UIcon name="i-heroicons-document" class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium">No content</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating some content.</p>
        <div class="mt-6">
          <UButton to="/dashboard/content/new" color="primary">
            Create Content
          </UButton>
        </div>
      </div>

      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Title
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Template
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Created
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Tags
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="content in filteredContents" :key="content.id">
            <td class="whitespace-nowrap px-6 py-4">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0 rounded-full bg-primary-50 flex items-center justify-center">
                  <UIcon name="i-heroicons-document-text" class="h-5 w-5 text-primary" />
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium">{{ content.title }}</div>
                  <div class="text-sm text-gray-500 truncate max-w-xs">
                    {{ truncateContent(content.content) }}
                  </div>
                </div>
              </div>
            </td>
            <td class="whitespace-nowrap px-6 py-4">
              <UBadge v-if="content.template" color="primary" variant="subtle">
                {{ getTemplateName(content.template) }}
              </UBadge>
              <span v-else class="text-sm text-gray-500">No template</span>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {{ formatDate(content.created) }}
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1">
                <UBadge
                    v-for="(tag, i) in parseTags(content.tags)"
                    :key="i"
                    color="gray"
                    variant="subtle"
                    size="xs"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </td>
            <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
              <div class="flex justify-end gap-2">
                <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-eye"
                    :to="`/dashboard/content/${content.id}`"
                    size="xs"
                />
                <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-pencil-square"
                    :to="`/dashboard/content/${content.id}/edit`"
                    size="xs"
                />
                <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-trash"
                    size="xs"
                    @click="confirmDelete(content)"
                />
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div class="flex flex-1 justify-between sm:hidden">
            <UButton
                color="gray"
                :disabled="page === 1"
                @click="page--"
            >
              Previous
            </UButton>
            <UButton
                color="gray"
                :disabled="page >= totalPages"
                @click="page++"
            >
              Next
            </UButton>
          </div>
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">{{ startIndex }}</span> to <span class="font-medium">{{ endIndex }}</span> of <span class="font-medium">{{ totalItems }}</span> results
              </p>
            </div>
            <UPagination
                v-model="page"
                :total="totalItems"
                :page-count="perPage"
            />
          </div>
        </div>
      </div>
    </UCard>

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
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Define page meta to use dashboard layout and auth middleware
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const authStore = useAuthStore()
const { $pb } = useNuxtApp()

// Pagination and filters
const page = ref(1)
const perPage = ref(10)
const contents = ref([])
const templateOptions = ref([])
const totalItems = ref(0)
const isLoading = ref(true)
const filters = ref({
  search: '',
  template: null
})

// Delete modal state
const showDeleteModal = ref(false)
const contentToDelete = ref(null)
const isDeleting = ref(false)

// Computed properties
const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value))
const startIndex = computed(() => (page.value - 1) * perPage.value + 1)
const endIndex = computed(() => Math.min(page.value * perPage.value, totalItems.value))
const filteredContents = computed(() => contents.value)

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Content truncation helper
const truncateContent = (content) => {
  if (!content) return ''
  return content.length > 50 ? content.slice(0, 50) + '...' : content
}

// Parse tags helper
const parseTags = (tags) => {
  if (!tags) return []
  return tags.split(',').map(tag => tag.trim()).filter(tag => tag)
}

// Get template name helper
const getTemplateName = (templateId) => {
  const template = templateOptions.value.find(t => t.value === templateId)
  return template ? template.label : 'Unknown Template'
}

// Confirm delete
const confirmDelete = (content) => {
  contentToDelete.value = content
  showDeleteModal.value = true
}

// Delete content
const deleteContent = async () => {
  if (!contentToDelete.value) return

  isDeleting.value = true

  try {
    await $pb.collection('content').delete(contentToDelete.value.id)

    // Remove from list
    contents.value = contents.value.filter(c => c.id !== contentToDelete.value.id)
    totalItems.value--

    // Close modal
    showDeleteModal.value = false
    contentToDelete.value = null

    // Show success message
    // You could add a toast notification here
  } catch (error) {
    console.error('Error deleting content:', error)
    // Show error message
  } finally {
    isDeleting.value = false
  }
}

// Fetch data
const fetchContents = async () => {
  isLoading.value = true

  try {
    // Build filter
    let filter = `user = "${authStore.currentUser.id}"`

    if (filters.value.template) {
      filter += ` && template = "${filters.value.template}"`
    }

    if (filters.value.search) {
      filter += ` && (title ~ "${filters.value.search}" || tags ~ "${filters.value.search}")`
    }

    // Fetch content
    const result = await $pb.collection('content').getList(page.value, perPage.value, {
      filter,
      sort: '-created',
      expand: 'template'
    })

    contents.value = result.items
    totalItems.value = result.totalItems
  } catch (error) {
    console.error('Error fetching content:', error)
    contents.value = []
    totalItems.value = 0
  } finally {
    isLoading.value = false
  }
}

// Fetch templates for filter dropdown
const fetchTemplates = async () => {
  try {
    const result = await $pb.collection('templates').getFullList({
      sort: 'name'
    })

    templateOptions.value = [
      { label: 'All Templates', value: null },
      ...result.map(template => ({
        label: template.name,
        value: template.id
      }))
    ]
  } catch (error) {
    console.error('Error fetching templates:', error)
    templateOptions.value = [{ label: 'All Templates', value: null }]
  }
}

// Watch for changes in page or filters to refetch data
watch([page, () => filters.value.search, () => filters.value.template], () => {
  fetchContents()
}, { deep: true })

// Initialize
onMounted(async () => {
  if (!authStore.isAuthenticated) return

  await Promise.all([
    fetchTemplates(),
    fetchContents()
  ])
})
</script>