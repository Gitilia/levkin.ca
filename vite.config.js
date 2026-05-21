import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        spec: resolve(__dirname, 'spec/index.html'),
        slab: resolve(__dirname, 'slab/index.html'),
        relay: resolve(__dirname, 'relay/index.html'),
        vault: resolve(__dirname, 'vault/index.html'),
        stack: resolve(__dirname, 'stack/index.html'),
      },
    },
  },
});
