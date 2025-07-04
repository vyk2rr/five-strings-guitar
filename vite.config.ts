/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'; // Change this import
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/five-strings-guitar/',
  test: {
    globals: true, // Add this for jest-dom matchers to work globally
    environment: 'jsdom', // Add this to simulate a browser environment
    setupFiles: './src/setupTests.ts',
  },
});

