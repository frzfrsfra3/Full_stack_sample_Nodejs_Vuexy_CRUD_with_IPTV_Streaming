<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="8">
          <v-card-title class="text-h5 text-center py-4">
            IPTV Admin Login
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="email"
                label="Email"
                prepend-inner-icon="mdi-email"
                :rules="[required]"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                prepend-inner-icon="mdi-lock"
                :rules="[required]"
                required
              ></v-text-field>
              <v-alert v-if="errorMsg" type="error" dense>{{ errorMsg }}</v-alert>
              <v-btn type="submit" block color="primary" :loading="loading" class="mt-4">
                Login
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/plugins/axios'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)
const router = useRouter()
const required = (v) => !!v || 'Required'

const login = async () => {
  if (!email.value || !password.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await axios.post('/auth/login', {
      email: email.value,
      password: password.value,
    })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    router.push('/ip-tv') // redirect to dashboard
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>