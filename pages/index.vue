<template>
  <div class="flex h-screen bg-black text-white">
    <!-- Barre latérale -->
    <Sidebar />

    <!-- Contenu principal -->
    <main class="flex-1 overflow-y-auto">
      <!-- Section Accueil -->
      <section class="p-8 bg-gradient-to-b from-gray-800 to-black">
        <!-- Bannière -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold">
            {{ greetingMessage }}, {{ userName || 'utilisateur' }} !
          </h1>
        </div>

        <!-- Section Écoutés récemment -->
        <div v-if="recentlyPlayed.length" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Écoutés récemment</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
              v-for="track in recentlyPlayed"
              :key="track.id"
              class="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition duration-200 ease-in-out transform hover:scale-105"
            >
              <img
                :src="track.album.images[0]?.url || require('~/assets/default-album.png')"
                :alt="track.name"
                class="w-full h-40 object-cover mb-2 rounded"
              />
              <h3 class="text-lg font-semibold">{{ track.name }}</h3>
              <p class="text-gray-400 text-sm">{{ track.artists[0]?.name }}</p>
              <button
                @click="playTrack(track.uri)"
                class="mt-2 w-full bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded"
              >
                Écouter
              </button>
            </div>
          </div>
        </div>
        <!-- Section Recommandations -->
        <div v-if="recommendations.length" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Recommandations pour vous</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
              v-for="track in recommendations"
              :key="track.id"
              class="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition duration-200 ease-in-out transform hover:scale-105"
            >
              <img
                :src="track.album.images[0]?.url || require('~/assets/default-album.png')"
                :alt="track.name"
                class="w-full h-40 object-cover mb-2 rounded"
              />
              <h3 class="text-lg font-semibold">{{ track.name }}</h3>
              <p class="text-gray-400 text-sm">{{ track.artists[0]?.name }}</p>
              <button
                @click="playTrack(track.uri)"
                class="mt-2 w-full bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded"
              >
                Écouter
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Lecteur en bas de page -->
      <footer v-if="currentTrack" class="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 flex items-center">
        <img
          :src="currentTrack.albumCover || require('~/assets/default-album.png')"
          :alt="`Pochette de l'album ${currentTrack.albumName}`"
          class="w-16 h-16 object-cover mr-4"
        />
        <div class="flex-1">
          <p class="text-white font-semibold">{{ currentTrack.name }}</p>
          <p class="text-gray-400">{{ currentTrack.artist }}</p>
        </div>
        <div class="flex items-center space-x-4">
          <button @click="pausePlayback" class="text-white hover:text-green-500">
            <span class="material-icons text-3xl">pause_circle_filled</span>
          </button>
        </div>
      </footer>
    </main>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import Sidebar from '~/components/Sidebar.vue';

export default {
  components: {
    Sidebar,
  },
  data() {
    return {
      player: null,
      deviceId: null,
      currentTrack: null,
      userName: null,
      recentlyPlayed: [],
      userPlaylists: [],
      recommendations: [],
    };
  },
  mounted() {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
      console.error('Token non disponible. Veuillez vous reconnecter.');
      this.$router.push('/login'); // Redirige vers la page de connexion si le token n'est pas disponible
      return;
    }

    // Initialiser le lecteur Spotify
    if (window.Spotify) {
      this.initializePlayer(token);
    } else {
      window.onSpotifyWebPlaybackSDKReady = () => {
        this.initializePlayer(token);
      };
    }

    // Récupérer les données nécessaires
    this.getUserInfo();
    this.getRecentlyPlayed();
    this.loadLibrary();
    this.getRecommendations();
  },
  computed: {
    greetingMessage() {
      const hour = new Date().getHours();
      if (hour < 12) {
        return 'Bonjour';
      } else if (hour < 18) {
        return 'Bon après-midi';
      } else {
        return 'Bonsoir';
      }
    },
  },
  methods: {
    ...mapMutations(['setDeviceId']),
    initializePlayer(token) {
      console.log('Initialisation du lecteur Spotify.');

      this.player = new Spotify.Player({
        name: 'Spotify Clone Player',
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      this.player.addListener('ready', ({ device_id }) => {
        console.log('Lecteur prêt avec Device ID :', device_id);
        this.deviceId = device_id;
        this.setDeviceId(device_id);
        localStorage.setItem('spotify_device_id', device_id); // Stocker le device ID
      });

      this.player.addListener('player_state_changed', (state) => {
        if (state) {
          const track = state.track_window.current_track;
          this.currentTrack = {
            name: track.name,
            artist: track.artists[0]?.name,
            albumCover: track.album.images[0]?.url,
            albumName: track.album.name,
          };
          console.log('Morceau en cours :', this.currentTrack);
        }
      });

      this.player.connect().then((success) => {
        if (success) {
          console.log('Lecteur Spotify connecté.');
        } else {
          console.error('Échec de la connexion au lecteur Spotify.');
        }
      });
    },
    async getUserInfo() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const userResponse = await this.$axios.$get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.userName = userResponse.display_name || userResponse.id;
      } catch (error) {
        console.error('Erreur lors de la récupération des informations de l\'utilisateur :', error.response?.data || error.message);
      }
    },
    async getRecentlyPlayed() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const response = await this.$axios.$get('https://api.spotify.com/v1/me/player/recently-played', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 8,
          },
        });

        const tracks = response.items.map(item => item.track);
        const uniqueTracks = tracks.filter((track, index, self) =>
          index === self.findIndex((t) => t.id === track.id)
        );

        this.recentlyPlayed = uniqueTracks;
      } catch (error) {
        console.error('Erreur lors de la récupération des éléments récemment écoutés :', error.response?.data || error.message);
      }
    },
    async loadLibrary() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const playlistsResponse = await this.$axios.$get('https://api.spotify.com/v1/me/playlists', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.userPlaylists = playlistsResponse.items || [];
      } catch (error) {
        console.error('Erreur lors du chargement de la bibliothèque :', error.response?.data || error.message);
      }
    },
    async getRecommendations() {
      try {
        const token = localStorage.getItem('spotify_access_token');

        // Récupérer les artistes suivis par l'utilisateur
        const followedArtistsResponse = await this.$axios.$get('https://api.spotify.com/v1/me/following', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            type: 'artist',
            limit: 5,
          },
        });

        const artistIds = followedArtistsResponse.artists.items.map(artist => artist.id);

        // Récupérer des recommandations basées sur ces artistes
        const recommendationsResponse = await this.$axios.$get('https://api.spotify.com/v1/recommendations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            seed_artists: artistIds.join(','),
            limit: 10,
          },
        });

        this.recommendations = recommendationsResponse.tracks;
      } catch (error) {
        console.error('Erreur lors de la récupération des recommandations :', error.response?.data || error.message);
      }
    },
    async playTrack(uri) {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const deviceId = this.deviceId || localStorage.getItem('spotify_device_id');

        if (!deviceId) {
          console.error('Device ID non disponible. Le lecteur n’est pas prêt.');
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
        console.error('Erreur lors du démarrage de la lecture :', error.response?.data || error.message);
      }
    },
    async playPlaylist(uri) {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const deviceId = this.deviceId || localStorage.getItem('spotify_device_id');

        if (!deviceId) {
          console.error('Device ID non disponible. Le lecteur n’est pas prêt.');
          return;
        }

        await this.$axios.$put(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            context_uri: uri,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log(`Lecture de la playlist ${uri}`);
      } catch (error) {
        console.error('Erreur lors de la lecture de la playlist :', error.response?.data || error.message);
      }
    },
    async pausePlayback() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const deviceId = this.deviceId || localStorage.getItem('spotify_device_id');

        if (!deviceId) {
          console.error('Device ID non disponible. Le lecteur n’est pas prêt.');
          return;
        }

        await this.$axios.$put(
          `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('Lecture mise en pause.');
      } catch (error) {
        console.error('Erreur lors de la mise en pause :', error.response?.data || error.message);
      }
    },
  },
};
</script>

<style scoped>
/* Styles spécifiques à la page d'accueil */
</style>
