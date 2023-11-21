import path from 'path'

export default {
    build: {
        target: 'esnext',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "index.html"),
                subview: path.resolve(__dirname, 'submenu/subindex.html'),
            }
        }
    }
}