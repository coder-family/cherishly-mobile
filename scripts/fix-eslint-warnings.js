#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to fix unused variable warnings by prefixing with underscore
function fixUnusedVariables(content) {
  // Fix function parameters that are unused
  content = content.replace(
    /(\w+):\s*[^,)]*\)\s*=>\s*{/g,
    (match, paramName) => {
      if (paramName && !paramName.startsWith('_')) {
        return match.replace(paramName, `_${paramName}`);
      }
      return match;
    }
  );

  // Fix destructured parameters that are unused
  content = content.replace(
    /(\w+):\s*[^,)]*,\s*(\w+):\s*[^,)]*,\s*(\w+):\s*[^,)]*\)/g,
    (match, param1, param2, param3) => {
      let newMatch = match;
      if (param1 && !param1.startsWith('_')) {
        newMatch = newMatch.replace(param1, `_${param1}`);
      }
      if (param2 && !param2.startsWith('_')) {
        newMatch = newMatch.replace(param2, `_${param2}`);
      }
      if (param3 && !param3.startsWith('_')) {
        newMatch = newMatch.replace(param3, `_${param3}`);
      }
      return newMatch;
    }
  );

  // Fix specific patterns for unused variables
  const patterns = [
    // Function parameters
    { regex: /(\w+)\s*:\s*[^,)]*\)\s*=>/g, replacement: (match, param) => {
      if (!param.startsWith('_')) return match.replace(param, `_${param}`);
      return match;
    }},
    // Destructured variables
    { regex: /(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*}/g, replacement: (match, p1, p2, p3) => {
      let newMatch = match;
      if (p1 && !p1.startsWith('_')) newMatch = newMatch.replace(p1, `_${p1}`);
      if (p2 && !p2.startsWith('_')) newMatch = newMatch.replace(p2, `_${p2}`);
      if (p3 && !p3.startsWith('_')) newMatch = newMatch.replace(p3, `_${p3}`);
      return newMatch;
    }},
  ];

  patterns.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });

  return content;
}

// Function to process a file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixUnusedVariables(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Function to recursively find TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main execution
const projectRoot = process.cwd();
const files = findFiles(projectRoot);

console.log(`Found ${files.length} files to process...`);

files.forEach(processFile);

console.log('Finished processing files.'); 