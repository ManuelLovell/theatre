import path from 'path'

export default {
    server: { cors: true },
    build: {
        target: 'esnext',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "index.html"),
                subview: path.resolve(__dirname, 'submenu/subindex.html'),
                storage: path.resolve(__dirname, 'submenu/storage.html'),
            }
        }
    }
}