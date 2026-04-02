import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/gas': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gas/, '/macros/s/AKfycbyFPatNeMfaR9sOxZ4hGD5a4WSRTDRfiKlWZW1WzA7WxZ35F-CxAQhN1F9nORGTDsrwiA/exec'),
      },
    },
  },
})
