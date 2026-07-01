import { defineStore } from 'pinia'
import axios from '@/plugins/axios'

export const useIpTvProfilesStore = defineStore('ipTvProfiles', {
  state: () => ({
    profiles: [],
    totalProfiles: 0,
  }),
  actions: {
    async fetchProfiles(params = {}) {
      const { data } = await axios.post('/tv_profiles/index', params)
      this.profiles = data.data
      this.totalProfiles = data.total
    },
    async getProfilesForActivation() {
      // used by activation forms – same as fetchProfiles
      await this.fetchProfiles()
    },
    async storeProfile(form) {
      return axios.post('/tv_profiles/create', form)
    },
    async deleteProfile(id) {
      return axios.post('/tv_profiles/delete', { id })
    },
  },
})