#!/usr/bin/env node
/**
 * Simple test runner that suppresses console.error during test execution
 */

const originalConsoleError = console.error;
let errorCount = 0;

// Suppress console.error temporarily
console.error = (...args) => {
    errorCount++;
    // Optionally log count every 10 errors
    if (errorCount % 10 === 0) {
        process.stderr.write('.');
    }
};

// Run after a slight delay to let module load
setTimeout(() => {
    console.error = originalConsoleError;
    console.log('\n');
    
    // Import and run Jest
    const jest = require('jest');
    jest.run(process.argv.slice(2));
}, 100);
