import { defineStore } from 'pinia'
import axios from "@axios";

export const useIpTvProfilesStore = defineStore('IpTvProfilesStore', {
    state: () => {
        return {
            profiles: [],
            totalProfiles: 0,
        }
    },
    actions:{
        //  Fetch all profiles
        async fetchProfiles(params) {
            const {data} = await axios.post('/tv_profiles/index', params);
            this.profiles = data.data
            this.totalProfiles = data.total
        },

        //  Delete a profile
        async deleteProfile(id) {
            const res = await axios.post('/tv_profiles/delete', {id});

            if (res.status === 200) {
                await this.fetchProfiles();
            }
        },

        //  Store a profile
        storeProfile(data) {
            return axios.post('/tv_profiles/create', data);
        },

        //  Update a profile
        updateProfile(data) {
            return axios.post('/tv_profiles/update', data);
        },

        //  Fetch profile by id
        fetchProfileByID(id) {
            return axios.get('/tv_profiles/get/'+id);
        },

        //  Get profiles for activation
        async getProfilesForActivation() {
            const {data} = await axios.get('/tvs/get_profiles');
            this.profiles = data.profiles
            this.totalProfiles = data.profiles.length
        },
    },
});