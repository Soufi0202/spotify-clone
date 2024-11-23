<template>
    <div>
      <nuxt />
    </div>
  </template>
  
  <script>
  export default {
    head() {
      return {
        script: [
          {
            src: 'https://sdk.scdn.co/spotify-player.js',
            async: true,
          },
        ],
      };
    },
    mounted() {
      // Définir onSpotifyWebPlaybackSDKReady
      if (!window.onSpotifyWebPlaybackSDKReady) {
        window.onSpotifyWebPlaybackSDKReady = () => {
          console.log('Spotify SDK chargé avec succès.');
        };
      }
    },
  };
  </script>
  