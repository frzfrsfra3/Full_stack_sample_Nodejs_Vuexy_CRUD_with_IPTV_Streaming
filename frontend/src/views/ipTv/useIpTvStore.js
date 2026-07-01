import { defineStore } from 'pinia'
import axios from "@axios";

export const useIpTvStore = defineStore('IpTvStore', {
    state: () => {
        return {
            customers: [],
            totalCustomers: 0,
            pendingCustomers: [],
            totalPendingCustomers: 0,
            isActivationAPICalling: false,
        }
    },
    actions: {
        //  Fetch all customers
        async fetchCustomers(params) {
            const {data} = await axios.post('/tvs/index', params);
            this.customers = data.data
            this.totalCustomers = data.total
        },

        //  Delete a tv customer
        async deleteCustomer(id) {
            const res = await axios.post('/tvs/delete', {id});

            if (res.status === 200) {
                await this.fetchCustomers();
            }
        },

        //  Create a new tv customer
        createCustomer(data) {
            return  axios.post('/tvs/create', data);
        },

        //  Fetch tv customer by id
        fetchCustomerById(id) {
            return axios.get('/tvs/get/' + id);
        },

        //  Update tv customer
        updateCustomer(data) {
            return axios.post('/tvs/update', data);
        },

        //  Activate tv customer
        async activateCustomer(payload) {
            this.isActivationAPICalling = true;
            const {data, error} = await axios.post('/tvs/activate', payload);
            this.isActivationAPICalling = false;
            if(error){
                return error
            }
            return data
        },

        //  Fetch all pending customers
        async fetchPendingCustomers(params) {
            const {data} = await axios.post('/tvs/pending', params);
            this.pendingCustomers = data.data
            this.totalPendingCustomers = data.total
        },

        //  Update customer status
        updateCustomerStatus(payload) {
            return axios.post('/tvs/activate_or_cancel', payload);
        }

    },
});