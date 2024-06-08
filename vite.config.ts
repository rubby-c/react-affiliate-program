import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import tailwindcss from 'tailwindcss';

import { libInjectCss } from 'vite-plugin-lib-inject-css'
import preserveDirectives from 'rollup-preserve-directives'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, './lib/index.ts'),
            name: 'react-affiliate-program',
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'tailwindcss'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    tailwindcss: 'tailwindcss',
                },
            },
        },
        sourcemap: false,
        emptyOutDir: true
    },
    plugins: [
        react(),
        dts({ rollupTypes: true }),
        preserveDirectives(),
        {
            ...libInjectCss(),
            enforce: 'pre',
        },
        {
            name: 'custom-swap-directive',
            generateBundle(_, bundle) {
                for (const chunk of Object.values(bundle)) {
                    if (chunk.type === 'chunk') {
                        if (chunk.code.includes('use client')) {
                            chunk.code = chunk.code.replace(/['"]use client['"];/, '')
                            chunk.code = `'use client';\n${chunk.code}`
                        }
                        if (chunk.code.includes('use server')) {
                            chunk.code = chunk.code.replace(/['"]use server['"];/, '')
                            chunk.code = `'use server';\n${chunk.code}`
                        }
                    }
                }
            }
        },
    ],
    css: {
        postcss: {
            plugins: [tailwindcss],
        },
    }
});