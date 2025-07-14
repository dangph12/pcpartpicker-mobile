// Polyfills for Node.js modules in React Native
import { Buffer } from '@craftzdog/react-native-buffer';
import 'react-native-get-random-values';

// Make Buffer available globally
global.Buffer = Buffer;

// Text encoder/decoder polyfill if needed
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('text-encoding').TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('text-encoding').TextDecoder;
}
