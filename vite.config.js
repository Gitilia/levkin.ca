import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5175,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        spec: resolve(__dirname, 'spec/index.html'),
        stackFolder: resolve(__dirname, 'stack-folder/index.html'),
        logo: resolve(__dirname, 'logo/index.html'),
        ops: resolve(__dirname, 'ops/index.html'),
      },
    },
  },
});
