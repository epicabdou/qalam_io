<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
      <div>
        <h1 class="text-xl font-bold">Create New Content</h1>
        <p class="mt-1 text-sm text-gray-500">
          Generate and customize new content
        </p>
      </div>
      <div>
        <UButton
            color="gray"
            variant="outline"
            to="/dashboard/content"
            icon="i-heroicons-arrow-left"
        >
          Back to Content
        </UButton>
      </div>
    </div>

    <UCard>
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

          <!-- Template Selection -->
          <div>
            <UFormGroup label="Template" name="template">
              <USelect
                  v-model="form.template"
                  :options="templateOptions"
                  placeholder="Select a template"
                  :error="errors.template"
                  @update:modelValue="onTemplateChange"
              />
            </UFormGroup>
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
          </div>

          <!-- Content Editor -->
          <div>
            <UFormGroup label="Content" name="content" required>
              <UTextarea
                  v-model="form.content"
                  placeholder="Enter your content here or generate from a template"
                  :rows="10"
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
          <div class="flex justify-between pt-4">
            <div>
              <!-- Generate button (only if template selected) -->
              <UButton
                  v-if="form.template"
                  color="gray"
                  variant="solid"
                  icon="i-heroicons-sparkles"
                  :loading="isGenerating"
                  :disabled="!canGenerate || isSubmitting"
                  @click="generateContent"
              >
                Generate Content
              </UButton>
            </div>

            <div class="flex gap-3">
              <UButton
                  color="gray"
                  variant="outline"
                  @click="resetForm"
                  :disabled="isSubmitting || isGenerating"
              >
                Reset
              </UButton>
              <UButton
                  type="submit"
                  color="primary"
                  :loading="isSubmitting"
                  :disabled="isGenerating || !isFormValid"
              >
                Save Content
              </UButton>
            </div>
          </div>
        </div>
      </form>
    </UCard>
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
const router = useRouter()

// Form state
const form = ref({
  title: '',
  content: '',
  template: null,
  parameters_used: {},
  tags: ''
})

// Validation and state
const errors = ref({})
const isSubmitting = ref(false)
const isGenerating = ref(false)
const templateOptions = ref([])
const templateParameters = ref([])

// Fetch templates for dropdown
const fetchTemplates = async () => {
  try {
    const result = await $pb.collection('templates').getFullList({
      sort: 'name'
    })

    templateOptions.value = result.map(template => ({
      label: template.name,
      value: template.id,
      data: template
    }))
  } catch (error) {
    console.error('Error fetching templates:', error)
    templateOptions.value = []
  }
}

// Handle template change
const onTemplateChange = () => {
  // Reset parameters
  form.value.parameters_used = {}

  if (!form.value.template) {
    templateParameters.value = []
    return
  }

  // Find the selected template
  const selectedTemplate = templateOptions.value.find(t => t.value === form.value.template)
  if (!selectedTemplate) {
    templateParameters.value = []
    return
  }

  // Get parameters from template
  const params = selectedTemplate.data.parameters || []
  templateParameters.value = Array.isArray(params) ? params : []
}

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

// Check if form is valid
const isFormValid = computed(() => {
  return form.value.title.trim() && form.value.content.trim()
})

// Check if can generate content
const canGenerate = computed(() => {
  if (!form.value.template) return false

  // Check if all required parameters are filled
  const requiredParams = templateParameters.value.filter(p => p.required)
  return requiredParams.every(param =>
      form.value.parameters_used[param.key] && form.value.parameters_used[param.key].trim()
  )
})

// Submit form
const submitForm = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // Prepare data
    const data = {
      title: form.value.title,
      content: form.value.content,
      user: authStore.currentUser.id,
      tags: form.value.tags,
      parameters_used: form.value.parameters_used
    }

    // Add template if selected
    if (form.value.template) {
      data.template = form.value.template
    }

    // Create record
    await $pb.collection('content').create(data)

    // Redirect to content list
    router.push('/dashboard/content')
  } catch (error) {
    console.error('Error creating content:', error)
    // You could add error handling/toast here
  } finally {
    isSubmitting.value = false
  }
}

// Generate content from template
const generateContent = async () => {
  if (!form.value.template) return

  isGenerating.value = true

  try {
    // Get template details
    const template = await $pb.collection('templates').getOne(form.value.template)

    // In a real application, you might call an AI service here
    // For now, we'll just use the template with basic param substitution
    let generatedContent = template.prompt_template || ''

    // Simple placeholder replacement
    Object.entries(form.value.parameters_used).forEach(([key, value]) => {
      generatedContent = generatedContent.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })

    // Set generated content
    form.value.content = generatedContent

    // If title is empty, generate a default title
    if (!form.value.title) {
      form.value.title = `${template.name} - ${new Date().toLocaleDateString()}`
    }
  } catch (error) {
    console.error('Error generating content:', error)
    // You could add error handling/toast here
  } finally {
    isGenerating.value = false
  }
}

// Reset form
const resetForm = () => {
  form.value = {
    title: '',
    content: '',
    template: null,
    parameters_used: {},
    tags: ''
  }
  errors.value = {}
}

// Initialize
onMounted(async () => {
  if (!authStore.isAuthenticated) return

  await fetchTemplates()
})
</script>