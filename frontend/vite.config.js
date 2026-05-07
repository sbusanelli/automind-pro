import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        // Add Tailwind CSS processing
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
})
