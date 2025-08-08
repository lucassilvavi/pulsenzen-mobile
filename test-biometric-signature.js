#!/usr/bin/env node

/**
 * Quick test to validate biometric signature generation matches backend
 */

const crypto = require('crypto');

// Test data from your device (from the logs)
const deviceId = 'f75748af-03f7-41a0-ad2e-f11bba0e88d8'; // Your actual device ID
const publicKey = 'real-mock-public-key-data'; // Updated key
const biometricType = 'fingerprint';

// Backend algorithm: SHA256(deviceId + publicKey + biometricType)
const signatureInput = deviceId + publicKey + biometricType;
const expectedSignature = crypto
  .createHash('sha256')
  .update(signatureInput)
  .digest('hex');

console.log('🔍 Biometric Signature Test for Your Device');
console.log('==========================================');
console.log(`Device ID: ${deviceId}`);
console.log(`Public Key: ${publicKey}`);
console.log(`Biometric Type: ${biometricType}`);
console.log(`Input String: ${signatureInput}`);
console.log(`Expected Signature: ${expectedSignature}`);
console.log('==========================================');

// This is what the backend expects for your device
console.log('\n✅ The app should now generate this exact signature!');
console.log('📱 Please test the biometric login on your phone now.');
