<template>
  <div>
    <!-- Page heading -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Billing & Subscription</h1>
      <p class="mt-1 text-sm text-gray-500">
        Manage your subscription, payment methods, and billing history
      </p>
    </div>

    <div class="space-y-6">
      <!-- Current Plan -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium">Current Plan</h2>
            <UBadge
                :color="currentPlan.type === 'free' ? 'gray' : 'primary'"
                variant="subtle"
            >
              {{ currentPlan.name }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-2xl font-bold">{{ currentPlan.price }}</h3>
              <p class="text-sm text-gray-500">{{ currentPlan.billingCycle }}</p>
            </div>

            <UButton
                v-if="currentPlan.type === 'free'"
                color="primary"
                @click="showUpgradeModal = true"
            >
              Upgrade Plan
            </UButton>

            <UButton
                v-else
                color="gray"
                variant="outline"
                @click="managePlan"
            >
              Manage Plan
            </UButton>
          </div>

          <div class="mt-4 rounded-md bg-gray-50 p-4">
            <h4 class="text-sm font-medium">Plan Features</h4>
            <ul class="mt-2 space-y-2">
              <li v-for="(feature, index) in currentPlan.features" :key="index" class="flex items-start">
                <UIcon name="i-heroicons-check-circle" class="mr-2 h-5 w-5 text-green-500" />
                <span class="text-sm">{{ feature }}</span>
              </li>
            </ul>
          </div>

          <div v-if="currentPlan.type !== 'free'" class="mt-4 border-t pt-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-medium">Next Billing Date</h4>
                <p class="text-sm text-gray-500">{{ currentPlan.nextBillingDate }}</p>
              </div>

              <UButton
                  color="red"
                  variant="ghost"
                  size="sm"
                  @click="showCancelModal = true"
              >
                Cancel Subscription
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Payment Methods -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-medium">Payment Methods</h2>
            <UButton
                color="primary"
                variant="ghost"
                size="sm"
                icon="i-heroicons-plus"
                @click="showAddPaymentModal = true"
                :disabled="currentPlan.type === 'free'"
            >
              Add Method
            </UButton>
          </div>
        </template>

        <div v-if="currentPlan.type === 'free'" class="py-6 text-center">
          <UIcon name="i-heroicons-credit-card" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium">No payment methods</h3>
          <p class="mt-1 text-sm text-gray-500">
            Upgrade to a paid plan to add payment methods.
          </p>
        </div>

        <div v-else-if="paymentMethods.length === 0" class="py-6 text-center">
          <UIcon name="i-heroicons-credit-card" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium">No payment methods</h3>
          <p class="mt-1 text-sm text-gray-500">
            Add a payment method to manage your subscription.
          </p>
          <div class="mt-4">
            <UButton
                color="primary"
                @click="showAddPaymentModal = true"
            >
              Add Payment Method
            </UButton>
          </div>
        </div>

        <div v-else>
          <ul class="divide-y divide-gray-200">
            <li v-for="method in paymentMethods" :key="method.id" class="flex items-center justify-between py-4">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0 rounded-md bg-gray-100 p-2">
                  <UIcon
                      :name="method.type === 'card' ? 'i-heroicons-credit-card' : 'i-heroicons-banknotes'"
                      class="h-6 w-6 text-gray-500"
                  />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium">{{ method.name }}</p>
                  <p class="text-xs text-gray-500">
                    {{ method.details }}
                    <span v-if="method.isDefault" class="ml-1 rounded bg-primary-50 px-1.5 py-0.5 text-xs font-medium text-primary">
                      Default
                    </span>
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UButton
                    v-if="!method.isDefault"
                    color="primary"
                    variant="ghost"
                    size="xs"
                    @click="setDefaultPayment(method.id)"
                >
                  Set Default
                </UButton>
                <UButton
                    color="gray"
                    variant="ghost"
                    size="xs"
                    icon="i-heroicons-trash"
                    @click="removePaymentMethod(method.id)"
                />
              </div>
            </li>
          </ul>
        </div>
      </UCard>

      <!-- Billing History -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-medium">Billing History</h2>
        </template>

        <div v-if="currentPlan.type === 'free'" class="py-6 text-center">
          <UIcon name="i-heroicons-document-text" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium">No billing history</h3>
          <p class="mt-1 text-sm text-gray-500">
            Your billing history will appear here once you upgrade to a paid plan.
          </p>
        </div>

        <div v-else-if="billingHistory.length === 0" class="py-6 text-center">
          <UIcon name="i-heroicons-document-text" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium">No billing history</h3>
          <p class="mt-1 text-sm text-gray-500">
            Your billing history will appear here once you make a payment.
          </p>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="invoice in billingHistory" :key="invoice.id">
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {{ formatDate(invoice.date) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ invoice.description }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {{ invoice.amount }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm">
                <UBadge
                    :color="invoice.status === 'paid' ? 'green' : invoice.status === 'pending' ? 'yellow' : 'red'"
                    variant="subtle"
                    size="sm"
                >
                  {{ invoice.status }}
                </UBadge>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <UButton
                    color="primary"
                    variant="ghost"
                    size="xs"
                    icon="i-heroicons-document-arrow-down"
                    @click="downloadInvoice(invoice.id)"
                >
                  Receipt
                </UButton>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>

    <!-- Success Alert -->
    <UAlert
        v-if="showSuccessAlert"
        color="green"
        variant="soft"
        icon="i-heroicons-check-circle"
        title="Success"
        class="mb-4 mt-6"
    >
      {{ successMessage }}
    </UAlert>

    <!-- Upgrade Plan Modal -->
    <UModal v-model="showUpgradeModal">
      <div class="p-4 sm:p-6">
        <div class="text-center">
          <h3 class="text-lg font-medium">Upgrade Your Plan</h3>
          <p class="mt-2 text-sm text-gray-500">
            Choose a plan that best fits your needs.
          </p>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UCard
              v-for="plan in availablePlans"
              :key="plan.type"
              class="border-2"
              :class="{'border-primary': plan.popular, 'border-transparent': !plan.popular}"
          >
            <div class="flex flex-col items-center text-center">
              <h4 class="text-lg font-medium">{{ plan.name }}</h4>
              <UBadge v-if="plan.popular" color="primary" variant="subtle" class="mb-2 mt-1">
                Most Popular
              </UBadge>
              <div class="my-2">
                <span class="text-2xl font-bold">{{ plan.price }}</span>
                <span class="text-sm text-gray-500">/{{ plan.billingCycle.split('/')[1] }}</span>
              </div>
              <ul class="mb-4 mt-2 space-y-2 text-sm text-gray-500">
                <li v-for="(feature, idx) in plan.features" :key="idx" class="flex items-center justify-center">
                  <UIcon name="i-heroicons-check" class="mr-1 h-4 w-4 text-green-500" />
                  {{ feature }}
                </li>
              </ul>
              <UButton
                  color="primary"
                  :variant="plan.popular ? 'solid' : 'outline'"
                  block
                  @click="selectPlan(plan)"
              >
                {{ currentPlan.type === plan.type ? 'Current Plan' : 'Select Plan' }}
              </UButton>
            </div>
          </UCard>
        </div>

        <div class="mt-4 flex justify-end gap-3">
          <UButton
              color="gray"
              @click="showUpgradeModal = false"
          >
            Cancel
          </UButton>
        </div>
      </div>
    </UModal>

    <!-- Add Payment Method Modal -->
    <UModal v-model="showAddPaymentModal">
      <div class="p-4 sm:p-6">
        <div class="text-center sm:text-left">
          <h3 class="text-lg font-medium">Add Payment Method</h3>
          <p class="mt-2 text-sm text-gray-500">
            Add a new payment method to your account.
          </p>
        </div>

        <form @submit.prevent="addPaymentMethod" class="mt-4">
          <div class="space-y-4">
            <UFormGroup label="Card Number" name="cardNumber">
              <UInput
                  v-model="newPayment.cardNumber"
                  placeholder="1234 5678 9012 3456"
                  required
              />
            </UFormGroup>

            <div class="grid grid-cols-2 gap-4">
              <UFormGroup label="Expiry Date" name="expiryDate">
                <UInput
                    v-model="newPayment.expiryDate"
                    placeholder="MM/YY"
                    required
                />
              </UFormGroup>

              <UFormGroup label="CVC" name="cvc">
                <UInput
                    v-model="newPayment.cvc"
                    placeholder="123"
                    required
                />
              </UFormGroup>
            </div>

            <UFormGroup label="Name on Card" name="name">
              <UInput
                  v-model="newPayment.name"
                  placeholder="John Doe"
                  required
              />
            </UFormGroup>

            <UFormGroup>
              <UCheckbox
                  v-model="newPayment.setDefault"
                  label="Set as default payment method"
              />
            </UFormGroup>
          </div>

          <div class="mt-4 flex justify-end gap-3">
            <UButton
                color="gray"
                @click="showAddPaymentModal = false"
            >
              Cancel
            </UButton>
            <UButton
                type="submit"
                color="primary"
                :loading="isAddingPayment"
            >
              Add Payment Method
            </UButton>
          </div>
        </form>
      </div>
    </UModal>

    <!-- Cancel Subscription Modal -->
    <UModal v-model="showCancelModal">
      <div class="p-4 sm:p-6">
        <div class="text-center sm:text-left">
          <UIcon name="i-heroicons-exclamation-triangle" class="mx-auto h-12 w-12 text-red-400 sm:mx-0" />
          <h3 class="mt-3 text-lg font-medium">Cancel Subscription</h3>
          <p class="mt-2 text-sm text-gray-500">
            Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing cycle.
          </p>

          <div class="mt-4">
            <UFormGroup label="Please tell us why you're leaving" name="cancelReason">
              <USelect
                  v-model="cancelReason"
                  :options="cancelReasons"
                  placeholder="Select a reason"
              />
            </UFormGroup>

            <UFormGroup v-if="cancelReason === 'other'" label="Additional feedback" name="cancelFeedback">
              <UTextarea
                  v-model="cancelFeedback"
                  placeholder="Please provide any additional feedback..."
                  :rows="3"
              />
            </UFormGroup>
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-3 sm:mt-6">
          <UButton
              color="gray"
              @click="showCancelModal = false"
          >
            Keep Subscription
          </UButton>
          <UButton
              color="red"
              @click="cancelSubscription"
              :loading="isCancelling"
          >
            Cancel Subscription
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

// Define page meta to apply auth middleware and account layout
definePageMeta({
  middleware: ['auth'],
  layout: 'account'
})

const authStore = useAuthStore()

// State
const showUpgradeModal = ref(false)
const showAddPaymentModal = ref(false)
const showCancelModal = ref(false)
const isAddingPayment = ref(false)
const isCancelling = ref(false)

// Current plan (this would come from the user's data in a real app)
const currentPlan = ref({
  type: 'free',
  name: 'Free',
  price: '$0',
  billingCycle: 'Free forever',
  features: [
    'Basic content creation',
    'Up to 5 templates',
    'Standard support',
    '1GB storage'
  ],
  nextBillingDate: 'N/A'
})

// Available plans
const availablePlans = ref([
  {
    type: 'free',
    name: 'Free',
    price: '$0',
    billingCycle: 'Free forever',
    features: [
      'Basic content creation',
      'Up to 5 templates',
      'Standard support',
      '1GB storage'
    ],
    popular: false
  },
  {
    type: 'pro',
    name: 'Pro',
    price: '$9.99',
    billingCycle: 'Billed monthly',
    features: [
      'Advanced content creation',
      'Unlimited templates',
      'Priority support',
      '10GB storage',
      'API access'
    ],
    popular: true
  },
  {
    type: 'team',
    name: 'Team',
    price: '$29.99',
    billingCycle: 'Billed monthly',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Admin controls',
      '100GB storage',
      'Advanced analytics'
    ],
    popular: false
  },
  {
    type: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    billingCycle: 'Contact sales',
    features: [
      'Everything in Team',
      'Custom integrations',
      'Dedicated support',
      'Unlimited storage',
      'SLA guarantees'
    ],
    popular: false
  }
])

// Payment methods (this would come from the user's data in a real app)
const paymentMethods = ref([])

// Billing history (this would come from the user's data in a real app)
const billingHistory = ref([])

// New payment form
const newPayment = ref({
  cardNumber: '',
  expiryDate: '',
  cvc: '',
  name: '',
  setDefault: true
})

// Cancel subscription
const cancelReason = ref('')
const cancelFeedback = ref('')
const cancelReasons = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'not_using', label: 'Not using the service enough' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'switching', label: 'Switching to another service' },
  { value: 'other', label: 'Other reason' }
]

// Success/error notification
const showSuccessAlert = ref(false)
const successMessage = ref('')

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Select a plan
const selectPlan = (plan) => {
  if (plan.type === currentPlan.value.type) {
    showUpgradeModal.value = false
    return
  }

  if (plan.type === 'enterprise') {
    // Redirect to contact sales page or show a contact form
    showUpgradeModal.value = false
    successMessage.value = 'Our sales team will contact you shortly.'
    showSuccessAlert.value = true
    setTimeout(() => {
      showSuccessAlert.value = false
    }, 5000)
    return
  }

  // In a real app, you would process the subscription change
  // For now, we'll just update the current plan
  currentPlan.value = {
    ...plan,
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  }

  showUpgradeModal.value = false
  successMessage.value = `You've successfully upgraded to the ${plan.name} plan!`
  showSuccessAlert.value = true
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 5000)
}

// Add payment method
const addPaymentMethod = () => {
  isAddingPayment.value = true

  // In a real app, you would process the payment method with a payment provider
  // For now, we'll just simulate adding a payment method
  setTimeout(() => {
    const last4 = newPayment.value.cardNumber.slice(-4)
    const expiry = newPayment.value.expiryDate

    // Create a new payment method
    const newMethod = {
      id: Date.now().toString(),
      type: 'card',
      name: `Card ending in ${last4}`,
      details: `Expires ${expiry}`,
      isDefault: newPayment.value.setDefault || paymentMethods.value.length === 0
    }

    // If this is set as default, update other methods
    if (newMethod.isDefault) {
      paymentMethods.value.forEach(method => {
        method.isDefault = false
      })
    }

    // Add to payment methods
    paymentMethods.value.push(newMethod)

    // Reset form
    newPayment.value = {
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      name: '',
      setDefault: true
    }

    // Close modal
    showAddPaymentModal.value = false

    // Show success message
    successMessage.value = 'Payment method added successfully'
    showSuccessAlert.value = true
    setTimeout(() => {
      showSuccessAlert.value = false
    }, 5000)

    isAddingPayment.value = false
  }, 1000)
}

// Set default payment method
const setDefaultPayment = (id) => {
  paymentMethods.value.forEach(method => {
    method.isDefault = method.id === id
  })

  // Show success message
  successMessage.value = 'Default payment method updated'
  showSuccessAlert.value = true
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 5000)
}

// Remove payment method
const removePaymentMethod = (id) => {
  const index = paymentMethods.value.findIndex(method => method.id === id)
  if (index !== -1) {
    const wasDefault = paymentMethods.value[index].isDefault
    paymentMethods.value.splice(index, 1)

    // If we removed the default method, set a new default
    if (wasDefault && paymentMethods.value.length > 0) {
      paymentMethods.value[0].isDefault = true
    }

    // Show success message
    successMessage.value = 'Payment method removed successfully'
    showSuccessAlert.value = true
    setTimeout(() => {
      showSuccessAlert.value = false
    }, 5000)
  }
}

// Cancel subscription
const cancelSubscription = () => {
  isCancelling.value = true

  // In a real app, you would process the subscription cancellation
  // For now, we'll just simulate cancelling the subscription
  setTimeout(() => {
    // Update current plan to free
    currentPlan.value = availablePlans.value.find(plan => plan.type === 'free')

    // Close modal
    showCancelModal.value = false

    // Reset cancel form
    cancelReason.value = ''
    cancelFeedback.value = ''

    // Show success message
    successMessage.value = 'Your subscription has been cancelled'
    showSuccessAlert.value = true
    setTimeout(() => {
      showSuccessAlert.value = false
    }, 5000)

    isCancelling.value = false
  }, 1000)
}

// Manage plan
const managePlan = () => {
  showUpgradeModal.value = true
}

// Download invoice
const downloadInvoice = (id) => {
  // In a real app, you would download the invoice PDF
  // For now, we'll just show a success message
  successMessage.value = `Invoice #${id} downloaded`
  showSuccessAlert.value = true
  setTimeout(() => {
    showSuccessAlert.value = false
  }, 5000)
}

// Load user data
const loadUserData = () => {
  // In a real app, you would load the user's subscription data
  // For now, we'll use mock data for illustration

  // For this demo, we'll check if the user is an admin and give them a Pro plan
  if (authStore.isAdmin) {
    currentPlan.value = {
      ...availablePlans.value.find(plan => plan.type === 'pro'),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    }

    // Add a payment method
    paymentMethods.value = [
      {
        id: '1',
        type: 'card',
        name: 'Card ending in 4242',
        details: 'Expires 12/25',
        isDefault: true
      }
    ]

    // Add billing history
    billingHistory.value = [
      {
        id: 'INV-001',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        description: 'Pro Plan Monthly Subscription',
        amount: '$9.99',
        status: 'paid'
      }
    ]
  }
}

// Initialize
onMounted(() => {
  loadUserData()
})
</script>