import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import type {ImportMetaEnv} from "./env"

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  let env: Record<keyof ImportMetaEnv, string> = loadEnv(mode, process.cwd())
  const serverUrl = env.VITE_SERVER_URL
  console.log(serverUrl)
  return {
    define: {
      // enable hydration mismatch details in production build
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true'
    },
    // // 设置scss的api类型为modern-compiler，解决控制台警告
    // css: {
    //   preprocessorOptions: {
    //     scss: {
    //       api: 'modern-compiler'
    //     }
    //   },
    //   silenceDeprecations: ['legacy-js-api']
    // },
    plugins: [
        vue()
    ],
    envDir: "./",
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: "0.0.0.0",
      post: 80,
      proxy: {
        "/api": {
          target: serverUrl,
          changeOrigin: true,
          secure: false,  // 忽略 HTTPS 安全验证
        },
        "/api/chat/ws":{
          target: serverUrl,
          changeOrigin: true,
          ws: true,
          secure: false,  // 忽略 HTTPS 安全验证
        },
        "/api/group/ws":{
          target: serverUrl,
          changeOrigin: true,
          ws: true,
          secure: false,  // 忽略 HTTPS 安全验证
        },
      }
    }
  }
})
