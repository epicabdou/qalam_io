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
              :to="`/dashboard/templates/${templateId}`"
              class="mr-2"
          />
          <h1 class="text-xl font-bold">Edit Template: {{ template ? template.name : 'Loading...' }}</h1>
        </div>
        <p v-if="template" class="mt-1 text-sm text-gray-500">
          Last updated: {{ formatDate(template.updated) }}
        </p>
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
        The template you're looking for doesn't exist or you don't have permission to edit it.
      </p>
      <div class="mt-6">
        <UButton to="/dashboard/templates" color="primary">
          Back to Templates
        </UButton>
      </div>
    </div>

    <UCard v-else>
      <!-- Form -->
      <form @submit.prevent="submitForm">
        <div class="space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Name -->
            <UFormGroup label="Template Name" name="name" required>
              <UInput
                  v-model="form.name"
                  placeholder="Enter a name for this template"
                  :error="errors.name"
                  required
              />
            </UFormGroup>

            <!-- Category -->
            <UFormGroup label="Category" name="category">
              <USelect
                  v-model="form.category"
                  :options="categoryOptions"
                  placeholder="Select a category"
                  :error="errors.category"
              />
            </UFormGroup>
          </div>

          <!-- Description -->
          <UFormGroup label="Description" name="description">
            <UTextarea
                v-model="form.description"
                placeholder="Describe what this template does"
                :rows="2"
                :error="errors.description"
            />
          </UFormGroup>

          <!-- Template Content -->
          <UFormGroup
              label="Template Content"
              name="prompt_template"
              required
              help="Use {{parameter_name}} syntax for dynamic content parameters"
          >
            <UTextarea
                v-model="form.prompt_template"
                placeholder="Enter your template content with {{parameters}} placeholders"
                :rows="10"
                :error="errors.prompt_template"
                required
            />
          </UFormGroup>

          <!-- Parameters -->
          <div>
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-base font-medium">Parameters</h3>
              <UButton
                  color="primary"
                  variant="ghost"
                  size="sm"
                  icon="i-heroicons-plus"
                  @click="addParameter"
              >
                Add Parameter
              </UButton>
            </div>

            <div v-if="form.parameters.length === 0" class="rounded-md bg-gray-50 p-4 text-center text-sm text-gray-500">
              <p>No parameters defined. Add parameters to make your template dynamic.</p>
              <p class="mt-1">
                Parameters should match the <code>{{parameter_name}}</code> placeholders in your template.
              </p>
            </div>

            <div v-else class="space-y-4">
              <UCard
                  v-for="(param, index) in form.parameters"
                  :key="index"
                  class="relative"
              >
                <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-x-mark"
                    size="xs"
                    class="absolute right-2 top-2"
                    @click="removeParameter(index)"
                />

                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <!-- Parameter Key -->
                  <UFormGroup label="Parameter Key" :name="`param-${index}-key`" required>
                    <UInput
                        v-model="param.key"
                        placeholder="product_name"
                        :error="paramErrors[index]?.key"
                        required
                    />
                    <template #help>
                      <span class="text-xs text-gray-500">
                        This should match the placeholder name: <code v-html="`{{${param.key}}}`"></code>
                      </span>
                    </template>
                  </UFormGroup>

                  <!-- Parameter Label -->
                  <UFormGroup label="Display Label" :name="`param-${index}-label`" required>
                    <UInput
                        v-model="param.label"
                        placeholder="Product Name"
                        :error="paramErrors[index]?.label"
                        required
                    />
                  </UFormGroup>
                </div>

                <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <!-- Parameter Type -->
                  <UFormGroup label="Parameter Type" :name="`param-${index}-type`">
                    <USelect
                        v-model="param.type"
                        :options="paramTypeOptions"
                        placeholder="Select type"
                    />
                  </UFormGroup>

                  <!-- Required -->
                  <UFormGroup label="Required" :name="`param-${index}-required`">
                    <UToggle
                        v-model="param.required"
                        :on-icon="{ icon: 'i-heroicons-check', class: 'text-white' }"
                        :off-icon="{ icon: 'i-heroicons-x-mark', class: 'text-gray-400' }"
                    />
                    <template #help>
                      <span class="text-xs text-gray-500">
                        Is this parameter required for generating content?
                      </span>
                    </template>
                  </UFormGroup>
                </div>

                <!-- Parameter Description -->
                <UFormGroup
                    label="Description"
                    :name="`param-${index}-description`"
                    class="mt-4"
                >
                  <UInput
                      v-model="param.description"
                      placeholder="Help text for this parameter"
                  />
                </UFormGroup>

                <!-- Parameter Placeholder -->
                <UFormGroup
                    label="Placeholder"
                    :name="`param-${index}-placeholder`"
                    class="mt-4"
                >
                  <UInput
                      v-model="param.placeholder"
                      placeholder="E.g. Enter your product name"
                  />
                </UFormGroup>
              </UCard>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between border-t pt-4">
            <UButton
                color="gray"
                variant="outline"
                :to="`/dashboard/templates/${templateId}`"
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
              Update Template
            </UButton>
          </div>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRoute, useRouter } from 'vue-router'

// Define page meta to use dashboard layout and admin middleware
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'admin'] // Requires admin privileges
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const { $pb } = useNuxtApp()

// Get the template ID from the route
const templateId = computed(() => route.params.id)

// Category options
const categoryOptions = [
  { label: 'Email', value: 'email' },
  { label: 'Social Media', value: 'social' },
  { label: 'Product Description', value: 'product' },
  { label: 'Advertisement', value: 'ad' }
]

// Parameter type options
const paramTypeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Textarea', value: 'textarea' },
  { label: 'Number', value: 'number' }
]

// State
const template = ref(null)
const isLoading = ref(true)
const isSubmitting = ref(false)

// Form state
const form = ref({
  name: '',
  description: '',
  category: null,
  prompt_template: '',
  parameters: []
})

// Validation state
const errors = ref({})
const paramErrors = ref([])

// Check if form is valid
const isFormValid = computed(() => {
  return form.value.name.trim() &&
      form.value.prompt_template.trim() &&
      validateParameters()
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

// Validate all form fields
const validateForm = () => {
  const newErrors = {}

  if (!form.value.name.trim()) {
    newErrors.name = 'Template name is required'
  }

  if (!form.value.prompt_template.trim()) {
    newErrors.prompt_template = 'Template content is required'
  } else {
    // Check for parameters in template
    const paramMatches = [...form.value.prompt_template.matchAll(/{{([^{}]+)}}/g)]
    const templateParams = paramMatches.map(match => match[1].trim())

    // Check if all template parameters have corresponding parameter definitions
    const definedParams = form.value.parameters.map(p => p.key)
    const missingParams = templateParams.filter(p => !definedParams.includes(p))

    if (missingParams.length > 0) {
      newErrors.prompt_template = `Missing parameter definitions for: ${missingParams.join(', ')}`
    }

    // Check if all defined parameters are used in the template
    const unusedParams = definedParams.filter(p => !templateParams.includes(p))
    if (unusedParams.length > 0) {
      newErrors.prompt_template = `${newErrors.prompt_template ? newErrors.prompt_template + '. ' : ''}Unused parameters: ${unusedParams.join(', ')}`
    }
  }

  errors.value = newErrors

  return Object.keys(newErrors).length === 0 && validateParameters()
}

// Validate parameters
const validateParameters = () => {
  const newParamErrors = []
  let valid = true

  form.value.parameters.forEach((param, index) => {
    const paramError = {}

    if (!param.key) {
      paramError.key = 'Parameter key is required'
      valid = false
    } else if (!/^[a-zA-Z0-9_]+$/.test(param.key)) {
      paramError.key = 'Key can only contain letters, numbers, and underscores'
      valid = false
    }

    if (!param.label) {
      paramError.label = 'Display label is required'
      valid = false
    }

    newParamErrors[index] = paramError
  })

  paramErrors.value = newParamErrors
  return valid
}

// Add a new parameter
const addParameter = () => {
  form.value.parameters.push({
    key: '',
    label: '',
    description: '',
    placeholder: '',
    type: 'text',
    required: true
  })
}

// Remove a parameter
const removeParameter = (index) => {
  form.value.parameters.splice(index, 1)
}

// Extract parameters from template
const extractParameters = () => {
  const paramMatches = [...form.value.prompt_template.matchAll(/{{([^{}]+)}}/g)]
  const templateParams = [...new Set(paramMatches.map(match => match[1].trim()))]

  // For each parameter in the template that's not already defined, add it
  templateParams.forEach(param => {
    if (!form.value.parameters.some(p => p.key === param)) {
      form.value.parameters.push({
        key: param,
        label: param.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: '',
        placeholder: '',
        type: 'text',
        required: true
      })
    }
  })
}

// Load template data into form
const loadFormData = () => {
  if (!template.value) return

  form.value.name = template.value.name || ''
  form.value.description = template.value.description || ''
  form.value.category = template.value.category || null
  form.value.prompt_template = template.value.prompt_template || ''
  form.value.parameters = Array.isArray(template.value.parameters) ?
      [...template.value.parameters] : []
}

// Submit form
const submitForm = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // Prepare data
    const data = {
      name: form.value.name,
      description: form.value.description,
      prompt_template: form.value.prompt_template,
      parameters: form.value.parameters
    }

    if (form.value.category) {
      data.category = form.value.category
    }

    // Update template
    await $pb.collection('templates').update(templateId.value, data)

    // Show success message (you could add a toast here)

    // Redirect to template view
    router.push(`/dashboard/templates/${templateId.value}`)
  } catch (error) {
    console.error('Error updating template:', error)
    // Handle error (you could add a toast here)
  } finally {
    isSubmitting.value = false
  }
}

// Fetch template
const fetchTemplate = async () => {
  isLoading.value = true

  try {
    template.value = await $pb.collection('templates').getOne(templateId.value)
    loadFormData()
  } catch (error) {
    console.error('Error fetching template:', error)
    template.value = null
  } finally {
    isLoading.value = false
  }
}

// Watch for template content changes to extract parameters
watch(() => form.value.prompt_template, () => {
  // Debounce to avoid extracting parameters too frequently
  clearTimeout(extractTimeoutId)
  extractTimeoutId = setTimeout(() => {
    extractParameters()
  }, 1000)
}, { deep: true })

let extractTimeoutId = null

// Clean up on unmount
onUnmounted(() => {
  if (extractTimeoutId) {
    clearTimeout(extractTimeoutId)
  }
})

// Initialize
onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.isAdmin) return
  await fetchTemplate()
})
</script>