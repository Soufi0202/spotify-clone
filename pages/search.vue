<template>
  <div>
    <h1>Recherche de musique</h1>
    <input
      v-model="query"
      @keyup.enter="search"
      placeholder="Recherchez des artistes, albums ou morceaux"
    />
    <div v-if="results">
      <div v-for="item in results" :key="item.id" class="result">
        <p>{{ item.name }}</p>
        <p v-if="item.artists">Artiste : {{ item.artists[0]?.name }}</p>
        <button @click="playTrack(item.uri)">Lire</button>
      </div>
    </div>
    <div v-else-if="loading">Recherche en cours...</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      query: '',
      results: null,
      loading: false,
    };
  },
  computed: {
    ...mapGetters(['getDeviceId']),
  },
  methods: {
    async search() {
      this.loading = true;

      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.error('Token non trouvé : redirection vers la connexion.');
          this.$router.push('/login');
          return;
        }

        const response = await this.$axios.$get(
          'https://api.spotify.com/v1/search',
          {
            params: { q: this.query, type: 'track' },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.results = response.tracks?.items || [];
      } catch (error) {
        console.error('Erreur lors de la recherche :', error.response?.data || error.message);
      } finally {
        this.loading = false;
      }
    },
    async playTrack(uri) {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const deviceId = this.getDeviceId;

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
        console.error('Erreur lors de la lecture du morceau :', error.response?.data || error.message);
      }
    },
  },
};
</script>

<style scoped>
/* Vos styles */
</style>
