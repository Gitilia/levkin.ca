import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        spec: resolve(__dirname, 'spec/index.html'),
        stackFolder: resolve(__dirname, 'stack-folder/index.html'),
      },
    },
  },
});
