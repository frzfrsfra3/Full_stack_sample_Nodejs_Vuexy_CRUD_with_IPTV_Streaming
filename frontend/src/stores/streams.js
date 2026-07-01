// src/stores/streams.js
import { defineStore } from 'pinia';
import axios from '@/plugins/axios';
import socket from '@/plugins/socket';

export const useStreamStore = defineStore('streams', {
  state: () => ({
    streams: [],
    pagination: { total: 0, lastPage: 1, perPage: 10 },
    loading: false,
  }),
  actions: {
    async fetchStreams(params = {}) {
      this.loading = true;
      try {
        const { data } = await axios.get('/streams', { params });
        this.streams = data.data;
        this.pagination = {
          total: data.total,
          lastPage: data.last_page,
          perPage: data.per_page,
        };
      } finally {
        this.loading = false;
      }
    },
    updateStreamInList(streamUpdate) {
      const index = this.streams.findIndex(s => s.id === streamUpdate.id);
      if (index !== -1) {
        this.streams[index] = { ...this.streams[index], ...streamUpdate };
      }
    },
    async createStream(form) {
      await axios.post('/streams', form);
      this.fetchStreams();
    },
    async deleteStream(id) {
      await axios.delete(`/streams/${id}`);
      this.fetchStreams();
    },
    async startStream(id) {
      await axios.post(`/streams/${id}/start`);
    },
    async stopStream(id) {
      await axios.post(`/streams/${id}/stop`);
    },
    async restartStream(id) {
      await this.startStream(id); // restart = start (since it's stopped)
    },
  },
});

// Listen for real-time updates
socket.on('stream.status.changed', (data) => {
  const store = useStreamStore();
  store.updateStreamInList(data.stream);
});