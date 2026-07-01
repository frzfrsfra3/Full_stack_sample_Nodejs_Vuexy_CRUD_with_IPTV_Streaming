<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    clipped
    color="grey-lighten-4"
    permanent
  >
    <v-list nav>
      <v-list-item
        prepend-icon="mdi-television-classic"
        title="IPTV Customers"
        to="/ip-tv"
        exact
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-account-multiple"
        title="Pending Customers"
        to="/ip-tv/filtered/pending"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-card-account-details"
        title="Profiles"
        to="/ip-tv/profiles"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-play-box-multiple"
        title="Streams"
        to="/ip-tv/streams"
      ></v-list-item>
    </v-list>
    <template v-slot:append>
      <div class="pa-2">
        <v-btn block color="error" variant="text" @click="logout">Logout</v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <v-app-bar app clipped-left color="primary" dark>
    <v-app-bar-nav-icon @click="drawer = !drawer" />
    <v-toolbar-title>IPTV Manager</v-toolbar-title>
  </v-app-bar>

  <v-main>
    <v-container fluid>
      <router-view />
    </v-container>
  </v-main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const drawer = ref(true)
const router = useRouter()

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>