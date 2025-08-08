import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    base: '/app/', // 与Go服务器React应用路由一致
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/account': 'http://localhost:8888/api',
            '/staff': 'http://localhost:8888/api',
            '/depart': 'http://localhost:8888/api',
            '/rank': 'http://localhost:8888/api',
            '/attendance_record': 'http://localhost:8888/api',
            '/recruitment': 'http://localhost:8888/api',
            '/candidate': 'http://localhost:8888/api',
            '/salary': 'http://localhost:8888/api',
            '/salary_record': 'http://localhost:8888/api',
            '/notification': 'http://localhost:8888/api',
            '/company': 'http://localhost:8888/api',
            "/password": 'http://localhost:8888/api',
            "/example": 'http://localhost:8888/api',
        },
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
})