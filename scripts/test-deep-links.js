#!/usr/bin/env node

const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const deepLinks = [
  { name: 'Login', url: 'growing-together://login' },
  { name: 'Register', url: 'growing-together://register' },
  { name: 'Home', url: 'growing-together://home' },
  { name: 'Profile', url: 'growing-together://profile' },
  { name: 'Reset Password', url: 'growing-together://reset-password?token=test-token-123' },
  { name: 'Child Profile', url: 'growing-together://children/child-123/profile' },
  { name: 'Memory', url: 'growing-together://memories/memory-456' },
  { name: 'Health Record', url: 'growing-together://health-records/health-789' },
];

function openDeepLink(url) {
  const command = process.platform === 'darwin' 
    ? `open "${url}"`
    : process.platform === 'win32'
    ? `start "${url}"`
    : `xdg-open "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error opening deep link: ${error.message}`);
      return;
    }
    console.log(`Opened: ${url}`);
  });
}

function showMenu() {
  console.log('\n=== Deep Link Tester ===');
  console.log('Select a deep link to test:');
  
  deepLinks.forEach((link, index) => {
    console.log(`${index + 1}. ${link.name}`);
  });
  
  console.log('0. Exit');
  console.log('=======================\n');
}

function handleInput(input) {
  const choice = parseInt(input);
  
  if (choice === 0) {
    console.log('Goodbye!');
    rl.close();
    return;
  }
  
  if (choice >= 1 && choice <= deepLinks.length) {
    const link = deepLinks[choice - 1];
    console.log(`\nOpening: ${link.name}`);
    console.log(`URL: ${link.url}`);
    openDeepLink(link.url);
  } else {
    console.log('Invalid choice. Please try again.');
  }
  
  setTimeout(showMenu, 1000);
}

console.log('Deep Link Tester for Growing Together App');
console.log('Make sure your app is running in development mode!');

showMenu();

rl.on('line', handleInput);

rl.on('close', () => {
  process.exit(0);
}); 