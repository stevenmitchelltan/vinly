/**
 * Verify Build Script
 * 
 * Checks that the built frontend has correct asset paths for GitHub Pages.
 * This prevents deploying with incorrect base paths (/ instead of /vinly/).
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INDEX_PATH = join(__dirname, '..', 'docs', 'index.html');

try {
  console.log('🔍 Verifying build output...');
  
  // Read the built index.html
  const html = readFileSync(INDEX_PATH, 'utf-8');
  
  // Check for asset references
  const cssMatches = html.match(/href="([^"]+\.css)"/g) || [];
  const jsMatches = html.match(/src="([^"]+\.js)"/g) || [];
  
  const allAssets = [...cssMatches, ...jsMatches];
  
  if (allAssets.length === 0) {
    console.error('❌ ERROR: No assets found in index.html');
    process.exit(1);
  }
  
  console.log(`   Found ${allAssets.length} asset references`);
  
  // Check each asset starts with /vinly/
  const incorrectPaths = [];
  
  for (const asset of allAssets) {
    // Extract the path from href="..." or src="..."
    const pathMatch = asset.match(/["']([^"']+)["']/);
    if (pathMatch) {
      const path = pathMatch[1];
      
      // Check if it starts with /vinly/
      if (!path.startsWith('/vinly/')) {
        incorrectPaths.push(path);
      }
    }
  }
  
  if (incorrectPaths.length > 0) {
    console.error('❌ ERROR: Found assets with incorrect paths:');
    incorrectPaths.forEach(path => {
      console.error(`   - ${path} (should start with /vinly/)`);
    });
    console.error('');
    console.error('💡 Fix: Make sure you built with:');
    console.error('   npm run build:pages');
    console.error('');
    console.error('   NOT: npm run build');
    process.exit(1);
  }
  
  console.log('✅ All asset paths are correct (/vinly/...)');
  process.exit(0);
  
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('❌ ERROR: docs/index.html not found');
    console.error('   Did the build complete successfully?');
  } else {
    console.error('❌ ERROR:', error.message);
  }
  process.exit(1);
}

