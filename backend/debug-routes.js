/**
 * Debug script to check if vector routes are properly registered
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

// Try to load the compiled vector routes
const vectorRoutesPath = path.join(__dirname, 'dist', 'routes', 'vector.js');

console.log('🔍 Debugging vector routes...\n');

// Check if the compiled file exists
if (fs.existsSync(vectorRoutesPath)) {
  console.log('✅ Compiled vector routes found at:', vectorRoutesPath);
  
  try {
    const vectorRoutes = require(vectorRoutesPath);
    console.log('✅ Vector routes loaded successfully');
    console.log('📋 Available routes:');
    
    // Create a test app to check routes
    const app = express();
    app.use('/api/vector', vectorRoutes);
    
    // Print the router stack
    console.log('Router stack:', vectorRoutes.stack?.length || 'No stack available');
    
  } catch (error) {
    console.error('❌ Error loading vector routes:', error.message);
  }
} else {
  console.log('❌ Compiled vector routes not found at:', vectorRoutesPath);
  console.log('📝 Source vector routes should be at:', path.join(__dirname, 'src', 'routes', 'vector.ts'));
  
  // Check if source exists
  const sourcePath = path.join(__dirname, 'src', 'routes', 'vector.ts');
  if (fs.existsSync(sourcePath)) {
    console.log('✅ Source vector routes found');
  } else {
    console.log('❌ Source vector routes not found');
  }
}

// Check if the main server file references vector routes
const mainIndexPath = path.join(__dirname, 'dist', 'index.js');
if (fs.existsSync(mainIndexPath)) {
  console.log('✅ Compiled main index found');
  const mainContent = fs.readFileSync(mainIndexPath, 'utf8');
  if (mainContent.includes('vector')) {
    console.log('✅ Vector routes referenced in main index');
  } else {
    console.log('❌ Vector routes not referenced in main index');
  }
} else {
  console.log('❌ Compiled main index not found');
}
