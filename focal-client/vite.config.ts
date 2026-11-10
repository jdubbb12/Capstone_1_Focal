import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // test: { // at the moment, we aren't doing client tests
  //   environment: "happy-dom",
  //   globals: true,
  // },
  // as for why Happy-DOM, it gives the testing suite in the future, the ability to actually
  // test UI elements, etc.
})
