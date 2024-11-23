<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Barre latérale -->
    <Sidebar />

    <!-- Contenu principal -->
    <main class="flex-1 overflow-y-auto">
      <!-- Header -->
      <header class="p-4 bg-gray-900">
        <h1 class="text-2xl font-bold">Votre Bibliothèque</h1>
      </header>

      <!-- Section Bibliothèque -->
      <section class="p-4">
        <!-- Onglets Playlists et Morceaux enregistrés -->
        <div class="mb-6">
          <button
            @click="libraryTab = 'playlists'"
            :class="{
              'text-green-500 border-b-2 border-green-500': libraryTab === 'playlists',
              'text-white hover:text-green-500': libraryTab !== 'playlists',
            }"
            class="mr-4 pb-2"
          >
            Playlists
          </button>
          <button
            @click="libraryTab = 'tracks'; loadSavedTracks()"
            :class="{
              'text-green-500 border-b-2 border-green-500': libraryTab === 'tracks',
              'text-white hover:text-green-500': libraryTab !== 'tracks',
            }"
            class="pb-2"
          >
            Morceaux
          </button>
        </div>

        <!-- Affichage des Playlists -->
        <div
          v-if="libraryTab === 'playlists'"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <div
            v-for="playlist in userPlaylists"
            :key="playlist.id"
            class="bg-gray-800 p-4 rounded-lg hover:bg-gray-700"
          >
            <img
              :src="playlist.images[0]?.url || require('~/assets/default-album.png')"
              :alt="`Playlist ${playlist.name}`"
              class="w-full h-48 object-cover mb-4 rounded"
            />
            <h3 class="text-lg font-semibold mb-1">{{ playlist.name }}</h3>
            <p class="text-gray-400 mb-2">{{ playlist.tracks.total }} titres</p>
            <button
              @click="playPlaylist(playlist.uri)"
              class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Lire
            </button>
          </div>
        </div>

        <!-- Affichage des Morceaux enregistrés -->
        <div v-if="libraryTab === 'tracks'">
          <div
            v-for="item in savedTracks"
            :key="item.track.id"
            class="flex items-center mb-4"
          >
            <img
              :src="item.track.album.images[0]?.url || require('~/assets/default-album.png')"
              :alt="`Pochette de l'album ${item.track.album.name}`"
              class="w-12 h-12 object-cover mr-4"
            />
            <div class="flex-1">
              <h3 class="text-lg font-semibold">{{ item.track.name }}</h3>
              <p class="text-gray-400">{{ item.track.artists[0]?.name }}</p>
            </div>
            <button
              @click="playTrack(item.track.uri)"
              class="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
            >
              Lire
            </button>
          </div>
        </div>
      </section>

      <!-- Lecteur en bas de page -->
      <footer
        v-if="currentTrack"
        class="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 flex items-center"
      >
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
      libraryTab: 'playlists', // 'playlists' ou 'tracks'
      userPlaylists: [],
      savedTracks: [],
      currentTrack: null,
      deviceId: null,
    };
  },
  mounted() {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
      console.error('Token non disponible. Veuillez vous reconnecter.');
      this.$router.push('/login');
      return;
    }

    // Charger la bibliothèque
    this.loadLibrary();

    // Initialiser le lecteur si nécessaire
    if (!this.deviceId) {
      if (window.Spotify) {
        this.initializePlayer(token);
      } else {
        window.onSpotifyWebPlaybackSDKReady = () => {
          this.initializePlayer(token);
        };
      }
    }
  },
  methods: {
    ...mapMutations(['setDeviceId']),
    async loadLibrary() {
      try {
        const token = localStorage.getItem('spotify_access_token');

        // Récupérer les playlists de l'utilisateur
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
    async loadSavedTracks() {
      try {
        const token = localStorage.getItem('spotify_access_token');

        const tracksResponse = await this.$axios.$get('https://api.spotify.com/v1/me/tracks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.savedTracks = tracksResponse.items || [];
      } catch (error) {
        console.error('Erreur lors du chargement des morceaux enregistrés :', error.response?.data || error.message);
      }
    },
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
    async playTrack(uri) {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!this.deviceId) {
          console.error('Device ID non disponible. Le lecteur n’est pas prêt.');
          return;
        }

        await this.$axios.$put(
          `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`,
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
        if (!this.deviceId) {
          console.error('Device ID non disponible. Le lecteur n’est pas prêt.');
          return;
        }

        await this.$axios.$put(
          `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`,
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
        if (!this.deviceId) {
          console.error('Device ID non disponible. Le lecteur n’est pas prêt.');
          return;
        }

        await this.$axios.$put(
          `https://api.spotify.com/v1/me/player/pause?device_id=${this.deviceId}`,
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

<style>
/* Styles globaux ou spécifiques à la bibliothèque */
</style>
