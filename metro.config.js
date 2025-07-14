const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for Expo SDK 53 + Supabase WebSocket issue
// This disables package.json exports which is causing the ws/stream error
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
