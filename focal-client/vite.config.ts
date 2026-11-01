import vue from '@vitejs/plugin-vue'
<<<<<<< Updated upstream
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
=======
import { defineConfig, loadEnv } from 'vite'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = { '/api': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:3000', changeOrigin: true } }
  return { plugins: [vue()], server: { host: 'localhost', port: 5173, strictPort: true, proxy },
    preview: { host: 'localhost', port: 4173, strictPort: true, proxy } }
>>>>>>> Stashed changes
})
