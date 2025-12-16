import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // This is necessary to make 'process.env.API_KEY' work in the client-side code
      // as intended by the Google GenAI SDK usage in this specific project structure.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process.env to prevent "process is not defined" ReferenceError in browser
      // if any code accesses process.env directly without the specific key.
      'process.env': {}
    }
  }
})