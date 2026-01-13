/**
 * Debug logger utility for Theatre
 * Set DEBUG to true to enable console logging
 */

const DEBUG = false;

export const Logger = {
    log: (...args: any[]) => {
        if (DEBUG) {
            console.log(...args);
        }
    },
    
    error: (...args: any[]) => {
        if (DEBUG) {
            console.error(...args);
        }
    },
    
    warn: (...args: any[]) => {
        if (DEBUG) {
            console.warn(...args);
        }
    }
};
