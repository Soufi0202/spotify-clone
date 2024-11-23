<template>
    <div>
      <h1>Connexion à Spotify</h1>
      <button @click="redirectToSpotify">Se connecter</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      redirectToSpotify() {
        const clientId = '063cf8acc49e4ed6aab98275a9cc5a93';
        const redirectUri = 'https://spotify-clone-weld-one.vercel.app/callback';
        const scopes = [
    'streaming', // Requis pour le SDK Spotify
    "user-read-email",
    'user-read-private',
    'user-modify-playback-state', // Contrôle de lecture
    'user-read-playback-state',   // Voir l'état de la lecture
    'user-read-currently-playing',
    'playlist-read-private',
    'user-read-recently-played',
    'user-library-read',
    'user-top-read',
    'user-follow-read',
  ];
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scope=${encodeURIComponent(scopes.join(' '))}`;
        window.location.href = authUrl;
      },
    },
  };
  </script>
  