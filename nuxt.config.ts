// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/scripts',
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  fonts: {
    families: [
      { name: 'Inter', provider: 'google' },
    ]
  },

  routeRules: {
    '/**': { ssr: false },
    '/api/**': { ssr: true },
    // Redirects legacy urls
    '/old-page': { redirect: '/new-page' }
  },

  hooks: {
    'prerender:routes' ({ routes }) {
      routes.clear()
    },
    'pages:extend': (pages) => {
      pages.forEach(route => {
        // Apply admin middleware to all dashboard routes
        if (route.path.startsWith('/dashboard')) {
          route.meta = route.meta || {}
          route.meta.middleware = route.meta.middleware || []
          if (!route.meta.middleware.includes('auth')) {
            route.meta.middleware.push('auth')
          }
        }
      })

      // Specifically protect template management routes
      pages.forEach(route => {
        if (route.path.startsWith('/dashboard/templates')) {
          route.meta = route.meta || {}
          route.meta.middleware = route.meta.middleware || []
          if (!route.meta.middleware.includes('admin')) {
            route.meta.middleware.push('admin')
          }
        }
      })

      // Apply auth middleware to all account routes
      pages.forEach(route => {
        if (route.path.startsWith('/account')) {
          route.meta = route.meta || {}
          route.meta.middleware = route.meta.middleware || []
          if (!route.meta.middleware.includes('auth')) {
            route.meta.middleware.push('auth')
          }
        }
      })
    }
  },

  runtimeConfig: {
    public: {
      pocketbaseUrl: process.env.POCKETBASE_URL || 'http://127.0.0.1:8090'
    }
  },
})