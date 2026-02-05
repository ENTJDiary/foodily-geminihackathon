/**
 * Build Verification Script
 * 
 * This script verifies that the production build contains the necessary
 * Firebase configuration. It's designed to run in CI/CD pipelines to catch
 * missing environment variables before deployment.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DIST_DIR = './dist';
const ASSETS_DIR = join(DIST_DIR, 'assets');

// Required Firebase config keys
const REQUIRED_CONFIG = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
];

// Expected project ID to verify correct Firebase project
const EXPECTED_PROJECT_ID = 'foodily-prod';

console.log('🔍 Verifying production build...\n');

try {
    // Find the main JavaScript bundle
    const files = readdirSync(ASSETS_DIR);
    const mainBundle = files.find(file => file.startsWith('index-') && file.endsWith('.js'));

    if (!mainBundle) {
        console.error('❌ Error: Could not find main JavaScript bundle in dist/assets/');
        process.exit(1);
    }

    console.log(`📦 Found main bundle: ${mainBundle}`);

    // Read the bundle content
    const bundlePath = join(ASSETS_DIR, mainBundle);
    const bundleContent = readFileSync(bundlePath, 'utf-8');

    // Check for Firebase project ID
    if (!bundleContent.includes(EXPECTED_PROJECT_ID)) {
        console.error(`❌ Error: Firebase project ID "${EXPECTED_PROJECT_ID}" not found in bundle`);
        console.error('   This indicates that Firebase environment variables were not embedded during build.');
        console.error('   Please check that GitHub Secrets are properly configured.');
        process.exit(1);
    }

    console.log(`✅ Firebase project ID found: ${EXPECTED_PROJECT_ID}`);

    // Check for Firebase config object pattern
    const hasFirebaseConfig = bundleContent.includes('authDomain') &&
        bundleContent.includes('storageBucket') &&
        bundleContent.includes('messagingSenderId');

    if (!hasFirebaseConfig) {
        console.error('❌ Error: Firebase configuration object not found in bundle');
        console.error('   The build may be missing environment variables.');
        process.exit(1);
    }

    console.log('✅ Firebase configuration object found');

    // Check for common issues
    if (bundleContent.includes('undefined') && bundleContent.includes('VITE_FIREBASE')) {
        console.warn('⚠️  Warning: Found "undefined" near Firebase config - environment variables may not be set');
    }

    // Verify bundle size is reasonable (should be > 100KB for a React + Firebase app)
    const stats = statSync(bundlePath);
    const sizeInKB = stats.size / 1024;

    console.log(`📊 Bundle size: ${sizeInKB.toFixed(2)} KB`);

    if (sizeInKB < 100) {
        console.warn('⚠️  Warning: Bundle size seems unusually small. Build may be incomplete.');
    }

    console.log('\n✅ Build verification passed!');
    console.log('🚀 Ready for deployment\n');

} catch (error) {
    console.error('❌ Build verification failed:', error.message);
    process.exit(1);
}
