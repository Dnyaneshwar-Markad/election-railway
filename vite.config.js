// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//     plugins: [
//         react({
//         fastRefresh: true,
//         include: "**/*.jsx",
//         })
//     ],
//     server: {
//         port: 5173,
//         open: true,
//         hmr: {
//         overlay: true
//         },
//         // watch: {
//         // usePolling: true
//         // }
//     },
//     resolve: {
//         extensions: ['.js', '.jsx', '.json'],
//         // alias: {
//         // // ✅ FIX: Prevent Plotly from trying to use Node buffer
//         // 'plotly.js': 'plotly.js-dist-min'
//         // }
//     },
//     cacheDir: '.vite',
//     optimizeDeps: {
//         include: ['react', 'react-dom', 'react-router-dom', 'axios', 'plotly.js-dist-min', 'react-plotly.js'],
//         // ✅ FIX: Exclude problematic Node.js modules
//         exclude: ['buffer']
//     },
//     define: {
//         // ✅ FIX: Polyfill for browser
//         'process.env': {},
//         global: 'globalThis'
//     }
//     })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    appType: 'spa',
    plugins: [
        react({
        fastRefresh: true,
        include: "**/*.jsx",
        }),
    ],
    server: {
        port: 5173,
        open: true,
        hmr: { overlay: true },
        historyApiFallback: true
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },
    cacheDir: '.vite',
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'axios', 'plotly.js-dist-min', 'react-plotly.js'],
        exclude: ['buffer'],
    },
})
