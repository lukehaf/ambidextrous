/* eslint-disable import/no-extraneous-dependencies */
import eslint from 'vite-plugin-eslint';
import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    eslint({
      overrideConfigFile: './.eslint.config.js',
    }),
  ],
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
      ],
    },
  },
});