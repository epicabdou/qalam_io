<template>
  <div
      class="flex items-center justify-center rounded-full overflow-hidden"
      :class="[
      size === 'xs' ? 'h-8 w-8' :
      size === 'sm' ? 'h-10 w-10' :
      size === 'md' ? 'h-12 w-12' :
      size === 'lg' ? 'h-16 w-16' :
      size === 'xl' ? 'h-20 w-20' :
      'h-12 w-12'
    ]"
  >
    <img
        v-if="src"
        :src="src"
        :alt="alt"
        class="h-full w-full object-cover"
    />
    <div
        v-else
        class="flex h-full w-full items-center justify-center bg-primary-50 text-primary"
        :class="[
        size === 'xs' ? 'text-sm' :
        size === 'sm' ? 'text-base' :
        size === 'md' ? 'text-lg' :
        size === 'lg' ? 'text-xl' :
        size === 'xl' ? 'text-2xl' :
        'text-lg'
      ]"
    >
      {{ initials }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    default: null
  },
  alt: {
    type: String,
    default: 'User'
  },
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  }
})

// Generate initials from name or email
const initials = computed(() => {
  if (props.name) {
    return props.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
  }

  if (props.email) {
    return props.email.substring(0, 2).toUpperCase()
  }

  return 'U'
})
</script>