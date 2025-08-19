#!/usr/bin/env node

/**
 * Test script to check storage behavior on web
 * This simulates what happens in the browser environment
 */

console.log('🔍 Testing Storage Behavior on Web...\n');

// Simulate AsyncStorage behavior on web
class MockAsyncStorage {
  constructor() {
    this.storage = new Map();
  }

  async setItem(key, value) {
    this.storage.set(key, value);
    console.log(`✅ setItem: ${key} = ${value}`);
  }

  async getItem(key) {
    const value = this.storage.get(key);
    console.log(`📖 getItem: ${key} = ${value}`);
    return value || null;
  }

  async removeItem(key) {
    const existed = this.storage.has(key);
    this.storage.delete(key);
    console.log(`🗑️  removeItem: ${key} (existed: ${existed})`);
  }

  async clear() {
    const count = this.storage.size;
    this.storage.clear();
    console.log(`🧹 clear: removed ${count} items`);
  }

  async getAllKeys() {
    const keys = Array.from(this.storage.keys());
    console.log(`🔑 getAllKeys: ${keys.length} keys`);
    return keys;
  }
}

// Simulate localStorage behavior
class MockLocalStorage {
  constructor() {
    this.storage = new Map();
  }

  setItem(key, value) {
    this.storage.set(key, value);
    console.log(`✅ localStorage.setItem: ${key} = ${value}`);
  }

  getItem(key) {
    const value = this.storage.get(key);
    console.log(`📖 localStorage.getItem: ${key} = ${value}`);
    return value || null;
  }

  removeItem(key) {
    const existed = this.storage.has(key);
    this.storage.delete(key);
    console.log(`🗑️  localStorage.removeItem: ${key} (existed: ${existed})`);
  }

  clear() {
    const count = this.storage.size;
    this.storage.clear();
    console.log(`🧹 localStorage.clear: removed ${count} items`);
  }
}

// Test storage operations
async function testStorage() {
  console.log('1. Testing AsyncStorage operations...');
  const asyncStorage = new MockAsyncStorage();
  
  // Test set/get
  await asyncStorage.setItem('test_key', 'test_value');
  await asyncStorage.getItem('test_key');
  
  // Test remove
  await asyncStorage.removeItem('test_key');
  await asyncStorage.getItem('test_key'); // Should return null
  
  console.log('\n2. Testing localStorage operations...');
  const localStorage = new MockLocalStorage();
  
  // Test set/get
  localStorage.setItem('test_key', 'test_value');
  localStorage.getItem('test_key');
  
  // Test remove
  localStorage.removeItem('test_key');
  localStorage.getItem('test_key'); // Should return null
  
  console.log('\n3. Testing clear operations...');
  
  // Add some test data
  await asyncStorage.setItem('token1', 'value1');
  await asyncStorage.setItem('token2', 'value2');
  localStorage.setItem('token1', 'value1');
  localStorage.setItem('token2', 'value2');
  
  // Clear both
  await asyncStorage.clear();
  localStorage.clear();
  
  console.log('\n4. Testing storage consistency...');
  
  // Test cross-platform storage
  await asyncStorage.setItem('auth_token', 'jwt_token_123');
  localStorage.setItem('auth_token', 'jwt_token_123');
  
  // Simulate logout process
  console.log('\n🔄 Simulating logout process...');
  
  // Clear AsyncStorage
  await asyncStorage.removeItem('auth_token');
  
  // Check if localStorage still has it
  const localValue = localStorage.getItem('auth_token');
  console.log(`After AsyncStorage clear, localStorage still has: ${localValue}`);
  
  // Clear localStorage too
  localStorage.removeItem('auth_token');
  
  // Final check
  const finalAsyncValue = await asyncStorage.getItem('auth_token');
  const finalLocalValue = localStorage.getItem('auth_token');
  
  console.log(`\n📊 Final state:`);
  console.log(`  AsyncStorage: ${finalAsyncValue}`);
  console.log(`  localStorage: ${finalLocalValue}`);
  
  if (finalAsyncValue === null && finalLocalValue === null) {
    console.log('✅ Both storages cleared successfully!');
  } else {
    console.log('❌ Storage not cleared properly!');
  }
}

testStorage().catch(console.error);
