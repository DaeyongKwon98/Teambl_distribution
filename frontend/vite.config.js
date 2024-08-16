import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,  // 소스맵 활성화
    rollupOptions: {
      external: ['react-dropzone'],  // react-dropzone을 외부 모듈로 처리
    },
  },
})
