
<template>
  <div>
    <!-- Header with Actions -->
    <div class="mb-6 flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
      <div>
        <h1 class="text-xl font-bold">Templates</h1>
        <p class="mt-1 text-sm text-gray-500">
          Browse and use content templates
        </p>
      </div>
      <div class="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
        <UInput
            v-model="search"
            placeholder="Search templates..."
            icon="i-heroicons-magnifying-glass"
            class="w-full md:w-64"
        />

        <!-- Add New Template button (admin only) -->
        <UButton
            v-if="authStore.isAdmin"
            color="primary"
            to="/dashboard/templates/new"
            icon="i-heroicons-plus"
        >
          New Template
        </UButton>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="mb-6">
      <UButtonGroup size="sm">
        <UButton
            @click="selectedCategory = null"
            :color="selectedCategory === null ? 'primary' : 'gray'"
            :variant="selectedCategory === null ? 'solid' : 'ghost'"
        >
          All
        </UButton>
        <UButton
            v-for="category in categories"
            :key="category.value"
            @click="selectedCategory = category.value"
            :color="selectedCategory === category.value ? 'primary' : 'gray'"
            :variant="selectedCategory === category.value ? 'solid' : 'ghost'"
        >
          {{ category.label }}
        </UButton>
      </UButtonGroup>
    </div>

    <!-- Templates Grid -->
    <div v-if="isLoading" class="py-12 text-center">
      <UIcon name="i-heroicons-arrow-path" class="mx-auto h-8 w-8 animate-spin text-gray-400" />
      <p class="mt-3 text-sm text-gray-500">Loading templates...</p>
    </div>

    <div v-else-if="filteredTemplates.length === 0" class="py-12 text-center">
      <UIcon name="i-heroicons-template" class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium">No templates found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ search ? `No templates matching "${search}"` : 'No templates available.' }}
      </p>
      <div v-if="authStore.isAdmin" class="mt-6">
        <UButton to="/dashboard/templates/new" color="primary">
          Create a Template
        </UButton>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
          v-for="template in filteredTemplates"
          :key="template.id"
          class="flex h-full flex-col"
      >
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div
                  class="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50"
              >
                <UIcon
                    class="h-6 w-6 text-primary"
                    :name="{
                    'email': 'i-heroicons-envelope',
                    'social': 'i-heroicons-share',
                    'product': 'i-heroicons-shopping-bag',
                    'ad': 'i-heroicons-megaphone',
                  }[template.category] || 'i-heroicons-template'"
                />
              </div>
              <h3 class="ml-3 text-lg font-medium">{{ template.name }}</h3>
            </div>
            <UBadge color="primary" variant="subtle">
              {{ template.category ? categoryLabels[template.category] : 'General' }}
            </UBadge>
          </div>

          <p class="mt-4 text-sm text-gray-500">
            {{ template.description || 'No description available.' }}
          </p>

          <div v-if="template.parameters && template.parameters.length > 0" class="mt-4">
            <p class="text-xs text-gray-400">Input parameters:</p>
            <div class="mt-1 flex flex-wrap gap-2">
              <UBadge
                  v-for="param in template.parameters.slice(0, 3)"
                  :key="param.key"
                  color="gray"
                  variant="subtle"
                  size="xs"
              >
                +{{ template.parameters.length - 3 }} more
              </UBadge>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end border-t pt-4">
          <UButton
              color="primary"
              variant="ghost"
              size="sm"
              :to="`/dashboard/content/new?template=${template.id}`"
          >
            Use Template
          </UButton>
          <UButton
              color="gray"
              variant="ghost"
              size="sm"
              :to="`/dashboard/templates/${template.id}`"
              icon="i-heroicons-eye"
          >
            Preview
          </UButton>
          <!-- Admin Actions -->
          <template v-if="authStore.isAdmin">
            <UButton
                color="gray"
                variant="ghost"
                size="sm"
                :to="`/dashboard/templates/${template.id}/edit`"
                icon="i-heroicons-pencil-square"
            >
              Edit
            </UButton>
            <UButton
                color="gray"
                variant="ghost"
                size="sm"
                icon="i-heroicons-trash"
                @click.stop="confirmDelete(template)"
            />
          </template>
        </div>
      </UCard>
    </div>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteModal">
      <div class="p-4 sm:p-6">
        <div class="text-center sm:text-left">
          <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto h-12 w-12 text-red-400 sm:mx-0" />
          <h3 class="mt-3 text-lg font-medium">Delete template</h3>
          <p class="mt-2 text-sm text-gray-500">
            Are you sure you want to delete this template? This action cannot be undone and may affect content that uses this template.
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
              @click="deleteTemplate"
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
import { useAuthStore } from '~/stores/auth'

// Define page meta to use dashboard layout and auth middleware
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const authStore = useAuthStore()
const { $pb } = useNuxtApp()

// State
const templates = ref([])
const isLoading = ref(true)
const search = ref('')
const selectedCategory = ref(null)
const showDeleteModal = ref(false)
const templateToDelete = ref(null)
const isDeleting = ref(false)

// Categories for filtering
const categories = [
  { label: 'Email', value: 'email' },
  { label: 'Social', value: 'social' },
  { label: 'Product', value: 'product' },
  { label: 'Ad', value: 'ad' }
]

// Category display labels
const categoryLabels = {
  'email': 'Email',
  'social': 'Social Media',
  'product': 'Product',
  'ad': 'Advertisement'
}

// Filtered templates based on search and category
const filteredTemplates = computed(() => {
  let result = templates.value

  // Filter by category
  if (selectedCategory.value) {
    result = result.filter(template => template.category === selectedCategory.value)
  }

  // Filter by search
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    result = result.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        (template.description && template.description.toLowerCase().includes(searchLower))
    )
  }

  return result
})

// Fetch templates
const fetchTemplates = async () => {
  isLoading.value = true

  try {
    const result = await $pb.collection('templates').getFullList({
      sort: 'name'
    })

    templates.value = result
  } catch (error) {
    console.error('Error fetching templates:', error)
    templates.value = []
  } finally {
    isLoading.value = false
  }
}

// Confirm delete
const confirmDelete = (template) => {
  templateToDelete.value = template
  showDeleteModal.value = true
}

// Delete template
const deleteTemplate = async () => {
  if (!templateToDelete.value) return

  isDeleting.value = true

  try {
    await $pb.collection('templates').delete(templateToDelete.value.id)

    // Remove from list
    templates.value = templates.value.filter(t => t.id !== templateToDelete.value.id)

    // Close modal
    showDeleteModal.value = false
    templateToDelete.value = null

    // Show success message
    // You could add a toast notification here
  } catch (error) {
    console.error('Error deleting template:', error)
    // Show error message
  } finally {
    isDeleting.value = false
  }
}

// Initialize
onMounted(async () => {
  if (!authStore.isAuthenticated) return

  await fetchTemplates()
})
</script>