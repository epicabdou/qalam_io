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
              to="/dashboard/templates"
              class="mr-2"
          />
          <h1 class="text-xl font-bold">{{ template ? template.name : 'Template Details' }}</h1>
        </div>
        <p v-if="template" class="mt-1 text-sm text-gray-500">
          Template preview
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
            color="primary"
            :to="`/dashboard/content/new?template=${templateId}`"
            icon="i-heroicons-plus"
        >
          Use Template
        </UButton>
        <!-- Admin Actions -->
        <template v-if="authStore.isAdmin">
          <UButton
              color="gray"
              variant="outline"
              :to="`/dashboard/templates/${templateId}/edit`"
              icon="i-heroicons-pencil-square"
          >
            Edit
          </UButton>
          <UButton
              color="red"
              variant="ghost"
              icon="i-heroicons-trash"
              @click="confirmDelete"
          >
            Delete
          </UButton>
        </template>
      </div>
    </div>

    <div v-if="isLoading" class="py-12 text-center">
      <UIcon name="i-heroicons-arrow-path" class="mx-auto h-8 w-8 animate-spin text-gray-400" />
      <p class="mt-3 text-sm text-gray-500">Loading template...</p>
    </div>

    <div v-else-if="!template" class="py-12 text-center">
      <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto h-12 w-12 text-amber-400" />
      <h3 class="mt-2 text-sm font-medium">Template not found</h3>
      <p class="mt-1 text-sm text-gray-500">
        The template you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <div class="mt-6">
        <UButton to="/dashboard/templates" color="primary">
          Back to Templates
        </UButton>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Template Details -->
      <UCard class="lg:col-span-2">
        <template #header>
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
        </template>

        <div class="space-y-6">
          <!-- Description -->
          <div>
            <h4 class="text-sm font-medium text-gray-500">Description</h4>
            <p class="mt-1">
              {{ template.description || 'No description available.' }}
            </p>
          </div>

          <!-- Template Content -->
          <div>
            <h4 class="text-sm font-medium text-gray-500">Template Content</h4>
            <div class="mt-2 rounded-md bg-gray-50 p-4">
              <pre class="whitespace-pre-wrap text-sm">{{ template.prompt_template }}</pre>
            </div>
          </div>

          <!-- Parameter Placeholders -->
          <div v-if="parameterPlaceholders.length > 0">
            <h4 class="text-sm font-medium text-gray-500">Parameter Placeholders</h4>
            <ul class="mt-2 list-inside list-disc space-y-1 text-sm">
              <li v-for="placeholder in parameterPlaceholders" :key="placeholder">
                {{ placeholder }}
              </li>
            </ul>
          </div>
        </div>
      </UCard>

      <!-- Parameters and Usage -->
      <div class="space-y-6">
        <!-- Parameters -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">Input Parameters</h3>
          </template>

          <div v-if="!template.parameters || template.parameters.length === 0" class="py-3 text-center">
            <p class="text-sm text-gray-500">No parameters defined for this template.</p>
          </div>

          <div v-else class="divide-y divide-gray-200">
            <div
                v-for="param in template.parameters"
                :key="param.key"
                class="py-3"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-medium">{{ param.label }}</h4>
                  <p v-if="param.description" class="mt-1 text-sm text-gray-500">
                    {{ param.description }}
                  </p>
                  <p class="mt-1 text-xs text-gray-400">
                    {{ param.required ? 'Required' : 'Optional' }} · {{ param.type || 'Text' }}
                  </p>
                </div>
                <UBadge v-if="param.required" color="red" variant="subtle" size="sm">
                  Required
                </UBadge>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Usage Info -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">Usage Information</h3>
          </template>

          <div class="space-y-4">
            <div>
              <h4 class="text-sm font-medium text-gray-500">Created</h4>
              <p class="mt-1 text-sm">{{ formatDate(template.created) }}</p>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-500">Last Updated</h4>
              <p class="mt-1 text-sm">{{ formatDate(template.updated) }}</p>
            </div>

            <UButton
                color="primary"
                block
                :to="`/dashboard/content/new?template=${templateId}`"
                class="mt-4"
            >
              Create Content with this Template
            </UButton>

            <!-- Admin Actions -->
            <div v-if="authStore.isAdmin" class="mt-3 space-y-3">
              <UButton
                  color="gray"
                  variant="outline"
                  block
                  :to="`/dashboard/templates/${templateId}/edit`"
                  icon="i-heroicons-pencil-square"
              >
                Edit Template
              </UButton>
              <UButton
                  color="red"
                  variant="ghost"
                  block
                  icon="i-heroicons-trash"
                  @click="confirmDelete"
              >
                Delete Template
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
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

// Get the template ID from the route
const templateId = computed(() => route.params.id)

// State
const template = ref(null)
const isLoading = ref(true)
const showDeleteModal = ref(false)
const isDeleting = ref(false)

// Category display labels
const categoryLabels = {
  'email': 'Email',
  'social': 'Social Media',
  'product': 'Product',
  'ad': 'Advertisement'
}

// Extract parameter placeholders from template content
const parameterPlaceholders = computed(() => {
  if (!template.value || !template.value.prompt_template) return []

  // Extract all {{param}} patterns from the template
  const regex = /{{([^{}]+)}}/g
  const matches = [...template.value.prompt_template.matchAll(regex)]

  // Get unique placeholders
  const placeholders = [...new Set(matches.map(match => match[1].trim()))]

  return placeholders
})

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

// Confirm delete
const confirmDelete = () => {
  showDeleteModal.value = true
}

// Delete template
const deleteTemplate = async () => {
  if (!template.value) return

  isDeleting.value = true

  try {
    await $pb.collection('templates').delete(templateId.value)

    // Close modal
    showDeleteModal.value = false

    // Redirect to templates list
    router.push('/dashboard/templates')

    // Show success message
    // You could add a toast notification here
  } catch (error) {
    console.error('Error deleting template:', error)
    // Show error message
  } finally {
    isDeleting.value = false
  }
}

// Fetch template
const fetchTemplate = async () => {
  isLoading.value = true

  try {
    template.value = await $pb.collection('templates').getOne(templateId.value)
  } catch (error) {
    console.error('Error fetching template:', error)
    template.value = null
  } finally {
    isLoading.value = false
  }
}

// Initialize
onMounted(async () => {
  if (!authStore.isAuthenticated) return

  await fetchTemplate()
})
</script>