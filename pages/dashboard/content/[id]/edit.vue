<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
      <div>
        <div class="flex items-center">
          <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-left"
              :to="`/dashboard/content/${contentId}`"
              class="mr-2"
          />
          <h1 class="text-xl font-bold truncate max-w-md">
            Edit: {{ content ? content.title : 'Content' }}
          </h1>
        </div>
        <p v-if="content" class="mt-1 text-sm text-gray-500">
          Last updated {{ formatDate(content.updated) }}
        </p>
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
        The content you're looking for doesn't exist or you don't have permission to edit it.
      </p>
      <div class="mt-6">
        <UButton to="/dashboard/content" color="primary">
          Back to Content List
        </UButton>
      </div>
    </div>

    <UCard v-else>
      <!-- Form -->
      <form @submit.prevent="submitForm">
        <div class="space-y-6">
          <!-- Title -->
          <div>
            <UFormGroup label="Title" name="title" required>
              <UInput
                  v-model="form.title"
                  placeholder="Enter a descriptive title"
                  :error="errors.title"
                  required
              />
            </UFormGroup>
          </div>

          <!-- Template Information (if used) -->
          <div v-if="content.template && templateDetails">
            <UAlert
                icon="i-heroicons-information-circle"
                title="Template Used"
                color="info"
                class="mb-4"
            >
              <p>
                This content was created using the template:
                <NuxtLink
                    :to="`/dashboard/templates/${content.template}`"
                    class="font-medium text-primary hover:underline"
                >
                  {{ templateDetails.name }}
                </NuxtLink>
              </p>
            </UAlert>
          </div>

          <!-- Template Parameters (if template selected) -->
          <div v-if="templateParameters.length > 0" class="rounded-lg border border-gray-200 p-4">
            <h3 class="mb-4 text-base font-medium">Template Parameters</h3>
            <div class="space-y-4">
              <div v-for="(param, index) in templateParameters" :key="index">
                <UFormGroup :label="param.label" :name="`params-${param.key}`">
                  <UTextarea
                      v-if="param.type === 'textarea'"
                      v-model="form.parameters_used[param.key]"
                      :placeholder="param.placeholder || `Enter ${param.label.toLowerCase()}`"
                      :rows="3"
                  />
                  <UInput
                      v-else
                      v-model="form.parameters_used[param.key]"
                      :placeholder="param.placeholder || `Enter ${param.label.toLowerCase()}`"
                  />
                  <template #help>
                    <div v-if="param.description" class="text-xs text-gray-500">
                      {{ param.description }}
                    </div>
                  </template>
                </UFormGroup>
              </div>
            </div>

            <div class="mt-4">
              <UButton
                  color="primary"
                  variant="outline"
                  icon="i-heroicons-sparkles"
                  :loading="isGenerating"
                  :disabled="isSubmitting"
                  @click="regenerateContent"
              >
                Regenerate Content
              </UButton>
            </div>
          </div>

          <!-- Content Editor -->
          <div>
            <UFormGroup label="Content" name="content" required>
              <UTextarea
                  v-model="form.content"
                  placeholder="Enter your content here"
                  :rows="15"
                  :error="errors.content"
                  required
              />
            </UFormGroup>
          </div>

          <!-- Tags -->
          <div>
            <UFormGroup label="Tags" name="tags">
              <UInput
                  v-model="form.tags"
                  placeholder="Enter comma-separated tags (e.g. blog, marketing, email)"
                  :error="errors.tags"
              />
              <template #help>
                <div class="text-xs text-gray-500">
                  Tags help you organize and find your content later
                </div>
              </template>
            </UFormGroup>
          </div>

          <!-- Actions -->
          <div class="flex justify-between border-t pt-4">
            <UButton
                color="gray"
                variant="outline"
                :to="`/dashboard/content/${contentId}`"
                :disabled="isSubmitting"
            >
              Cancel
            </UButton>

            <UButton
                type="submit"
                color="primary"
                :loading="isSubmitting"
                :disabled="!isFormValid"
            >
              Update Content
            </UButton>
          </div>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
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

// Get the content ID from the route
const contentId = computed(() => route.params.id)

// State
const content = ref(null)
const templateDetails = ref(null)
const templateParameters = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const isGenerating = ref(false)

// Form state
const form = ref({
  title: '',
  content: '',
  tags: '',
  parameters_used: {}
})

// Validation state
const errors = ref({})

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

// Check if form is valid
const isFormValid = computed(() => {
  return form.value.title.trim() && form.value.content.trim()
})

// Validate form
const validateForm = () => {
  const newErrors = {}

  if (!form.value.title.trim()) {
    newErrors.title = 'Title is required'
  }

  if (!form.value.content.trim()) {
    newErrors.content = 'Content is required'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Load content data into form
const loadFormData = () => {
  if (!content.value) return

  form.value.title = content.value.title || ''
  form.value.content = content.value.content || ''
  form.value.tags = content.value.tags || ''
  form.value.parameters_used = content.value.parameters_used || {}

  // Load template details if available
  if (content.value.template) {
    fetchTemplateDetails(content.value.template)
  }
}

// Fetch template details
const fetchTemplateDetails = async (templateId) => {
  try {
    templateDetails.value = await $pb.collection('templates').getOne(templateId)

    // Set template parameters
    templateParameters.value = templateDetails.value.parameters || []

    // Initialize any missing parameters
    if (templateParameters.value.length > 0) {
      templateParameters.value.forEach(param => {
        if (!form.value.parameters_used[param.key]) {
          form.value.parameters_used[param.key] = ''
        }
      })
    }
  } catch (error) {
    console.error('Error fetching template details:', error)
    templateDetails.value = null
    templateParameters.value = []
  }
}

// Regenerate content from template
const regenerateContent = async () => {
  if (!templateDetails.value) return

  isGenerating.value = true

  try {
    // In a real application, you might call an AI service here
    // For now, we'll just use the template with basic param substitution
    let generatedContent = templateDetails.value.prompt_template || ''

    // Simple placeholder replacement
    Object.entries(form.value.parameters_used).forEach(([key, value]) => {
      generatedContent = generatedContent.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })

    // Set generated content
    form.value.content = generatedContent
  } catch (error) {
    console.error('Error generating content:', error)
    // You could add error handling/toast here
  } finally {
    isGenerating.value = false
  }
}

// Submit form
const submitForm = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // Prepare data
    const data = {
      title: form.value.title,
      content: form.value.content,
      tags: form.value.tags,
      parameters_used: form.value.parameters_used
    }

    // Update record
    await $pb.collection('content').update(contentId.value, data)

    // Redirect to content view
    router.push(`/dashboard/content/${contentId.value}`)

    // Show success message
    // You could add a toast notification here
  } catch (error) {
    console.error('Error updating content:', error)
    // You could add error handling/toast here
  } finally {
    isSubmitting.value = false
  }
}

// Fetch content
const fetchContent = async () => {
  isLoading.value = true

  try {
    content.value = await $pb.collection('content').getOne(contentId.value)

    // Check if user has permission to edit this content
    if (content.value.user !== authStore.currentUser.id) {
      content.value = null
      return
    }

    // Load form data
    loadFormData()
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

// Watch for changes in content
watch(() => content.value, () => {
  if (content.value) {
    loadFormData()
  }
}, { deep: true })
</script>