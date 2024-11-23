export default {
  modules: ['@nuxtjs/axios', '@nuxtjs/auth-next', '@nuxt/postcss8'],

  axios: {
    baseURL: 'https://api.spotify.com/v1', // API Spotify
  },
  css: [
    // Inclure Tailwind CSS
    '@/assets/css/tailwind.css',
  ],
  build: {
    postcss: {
      plugins: {
        'postcss-import': {},
        tailwindcss: {},
        autoprefixer: {},
      },
    },
  },

  head: {
    // ... autres options ...
    link: [
      // ... autres liens ...
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
      },
    ],
  },

  auth: {
    strategies: {
      spotify: {
        scheme: 'oauth2',
        endpoints: {
          authorization: 'https://accounts.spotify.com/authorize',
          token: 'https://accounts.spotify.com/api/token',
          userInfo: 'https://api.spotify.com/v1/me',
        },
        clientId: '063cf8acc49e4ed6aab98275a9cc5a93', // Remplacez avec votre Client ID
        clientSecret: 'c8bae345051d459682d054de134f2248', // Remplacez avec votre Client Secret
        scope: ['user-read-private', 'user-read-email', 'playlist-read-private'],
        grantType: 'authorization_code',
        responseType: 'code',
        redirectUri: 'http://localhost:3000/callback',
      },
    },
  },
};
