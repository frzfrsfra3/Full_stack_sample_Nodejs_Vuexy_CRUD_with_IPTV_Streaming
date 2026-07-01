import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite'
export default defineConfig({
  plugins: [vue(),
  AutoImport({
    imports: ['vue', 'pinia', 'vue-router', 'vue-i18n'],
    dts: 'src/auto-imports.d.ts',
  })


  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, 'src/@core'),           // ← correct folder
      '@validators': path.resolve(__dirname, 'src/validators'),
      '@axios': path.resolve(__dirname, 'src/plugins/axios'),  // ← for old store imports
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',  // dev proxy to Node backend
    },
  },
});