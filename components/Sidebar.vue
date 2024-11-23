<template>
    <aside class="w-64 bg-gray-800 p-4">
      <div class="mb-8">
        <img src="../assets/logo-spotify.png" alt="Spotify Logo" class="h-16 mx-auto">
      </div>
      <!-- Menu de navigation -->
      <nav>
        <ul>
          <li class="mb-4">
            <nuxt-link
              to="/"
              exact
              class="flex items-center text-white hover:text-green-500"
              active-class="text-green-500"
            >
              <span class="material-icons mr-4">home</span>
              Accueil
            </nuxt-link>
          </li>
          <li class="mb-4">
            <nuxt-link
              to="/dashboard"
              class="flex items-center text-white hover:text-green-500"
              active-class="text-green-500"
            >
              <span class="material-icons mr-4">search</span>
              Rechercher
            </nuxt-link>
          </li>
          <li class="mb-4">
            <nuxt-link
              to="/library"
              class="flex items-center text-white hover:text-green-500"
              active-class="text-green-500"
            >
              <span class="material-icons mr-4">library_music</span>
              Votre Bibliothèque
            </nuxt-link>
          </li>
        </ul>
      </nav>
    </aside>
  </template>
  
  <script>
  export default {
    name: 'Sidebar',
  };
  </script>
  
  <style scoped>
  /* Vous pouvez ajouter des styles spécifiques ici */
  </style>
  