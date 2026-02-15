import { type } from '@tauri-apps/plugin-os';

let os: string | null = null;

export function useOS() {
    function isWin() {
        if (os) {
            return os == "windows";
        }

        os = type();
        return os == "windows";
    }

    function isMac() {
        if (os) {
            return os == "macos";
        }

        os = type();
        return os == "macos";
    }

    function isLinux() {
        if (os) {
            return os == "linux";
        }
        os = type();
        return os == "linux";
    }

    return {isWin, isMac, isLinux};
}

