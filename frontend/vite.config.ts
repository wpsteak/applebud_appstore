import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
const GAS_EXEC = 'https://script.google.com/macros/s/AKfycbyfNcx41yw_WKzyjSgSkDvMjsjYBHzVFSngb0Ia53jIS8WotrIrhII74wPBDd5qvzcjkA/exec'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'gas-proxy',
      configureServer(server) {
        console.log('[gas-proxy] middleware registered ✓')
        server.middlewares.use('/gas', async (req, res) => {
          const url = new URL(req.url!, 'http://localhost')
          const target = GAS_EXEC + url.search

          try {
            let body: string | undefined
            if (req.method === 'POST') {
              body = await new Promise<string>((resolve) => {
                let data = ''
                req.on('data', (chunk) => { data += chunk })
                req.on('end', () => resolve(data))
              })
            }

            const response = await fetch(target, {
              method: req.method,
              redirect: 'follow',
              headers: {
                'Content-Type': 'text/plain;charset=utf-8',
                'Cookie': req.headers['cookie'] ?? '',
                'User-Agent': req.headers['user-agent'] ?? 'Mozilla/5.0',
              },
              ...(body ? { body } : {}),
            })

            const text = await response.text()
            console.log('[gas-proxy]', req.method, target)
            console.log('[gas-proxy] status:', response.status, '| url:', response.url)
            console.log('[gas-proxy] body preview:', text.slice(0, 200))
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(text)
          } catch (e: any) {
            res.writeHead(500)
            res.end(JSON.stringify({ success: false, data: null, error: { code: 'PROXY_ERROR', message: e.message } }))
          }
        })
      },
    },
  ],
})
