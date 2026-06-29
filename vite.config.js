import path from 'path'
import fs from 'fs'

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));
let appVersion = packageJson.version;

try
{
    const manifestJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'public/manifest.json'), 'utf-8'));
    if (manifestJson.version)
    {
        appVersion = String(manifestJson.version);
    }
}
catch (error)
{
    // Keep package.json version fallback when manifest is unavailable.
}

export default {
    server: { cors: true },
    define: {
        __APP_VERSION__: JSON.stringify(appVersion),
    },
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