<template>
    <div class="flex h-screen bg-gray-900 text-white">
      <!-- Barre latérale -->
      <aside class="w-64 bg-gray-800 p-4">
        <nuxt-link to="/dashboard" class="text-white hover:text-green-500 flex items-center mb-4">
          <span class="material-icons mr-2">arrow_back</span>
          Retour
        </nuxt-link>
      </aside>
  
      <!-- Contenu principal -->
      <main class="flex-1 overflow-y-auto">
        <header class="p-4 bg-gray-900">
          <h1 class="text-2xl font-bold">{{ playlistName }}</h1>
          <p class="text-gray-400">{{ playlistDescription }}</p>
        </header>
  
        <!-- Liste des morceaux -->
        <section class="p-4">
          <div v-if="loading" class="text-center mt-8">
            <svg
              class="animate-spin h-8 w-8 text-white mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <p class="mt-4">Chargement des morceaux...</p>
          </div>
  
          <div v-else class="space-y-4">
            <div
              v-for="track in tracks"
              :key="track.id"
              class="flex items-center bg-gray-800 p-4 rounded hover:bg-gray-700"
            >
              <img
                :src="track.album.images[0]?.url || require('~/assets/default-album.png')"
                :alt="track.name"
                class="w-16 h-16 object-cover mr-4"
              />
              <div class="flex-1">
                <h3 class="text-lg font-semibold">{{ track.name }}</h3>
                <p class="text-gray-400">{{ track.artists[0]?.name }}</p>
              </div>
              <button
                @click="playTrack(track.uri)"
                class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              >
                Lire
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        playlistName: '',
        playlistDescription: '',
        tracks: [],
        loading: true,
      };
    },
    async fetch() {
      const token = localStorage.getItem('spotify_access_token');
      const playlistId = this.$route.params.id; // Récupère l'ID de la playlist depuis l'URL
  
      if (!token || !playlistId) {
        console.error('Token ou ID de playlist non disponible.');
        this.$router.push('/library');
        return;
      }
  
      try {
        // Récupérer les détails de la playlist
        const playlistResponse = await this.$axios.$get(
          `https://api.spotify.com/v1/playlists/${playlistId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        this.playlistName = playlistResponse.name;
        this.playlistDescription = playlistResponse.description;
        this.tracks = playlistResponse.tracks.items.map((item) => item.track);
      } catch (error) {
        console.error('Erreur lors du chargement de la playlist :', error.response?.data || error.message);
      } finally {
        this.loading = false;
      }
    },
    methods: {
      async playTrack(uri) {
        try {
          const token = localStorage.getItem('spotify_access_token');
          const deviceId = localStorage.getItem('spotify_device_id'); // Stockez le device ID dans localStorage si nécessaire
  
          if (!deviceId) {
            console.error('Device ID non disponible.');
            return;
          }
  
          await this.$axios.$put(
            `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
            {
              uris: [uri],
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
  
          console.log(`Lecture démarrée pour ${uri}`);
        } catch (error) {
          console.error('Erreur lors de la lecture du morceau :', error.response?.data || error.message);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Styles spécifiques pour cette page */
  </style>
  