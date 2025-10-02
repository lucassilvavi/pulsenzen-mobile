import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileService } from './modules/profile/services/ProfileService';

// Test script to verify avatar functionality
async function testAvatarFunctionality() {
  console.log('🧪 Testing Avatar Functionality...');
  
  try {
    // Test 1: Check if we can retrieve avatar (should be null initially)
    console.log('📱 Test 1: Getting current avatar...');
    const currentAvatar = await ProfileService.getUserAvatar();
    console.log('Current avatar:', currentAvatar);
    
    // Test 2: Save a test avatar URI
    console.log('💾 Test 2: Saving test avatar...');
    const testAvatarUri = 'file:///test/path/to/avatar.jpg';
    const saveResult = await ProfileService.saveUserAvatar(testAvatarUri);
    console.log('Save result:', saveResult);
    
    // Test 3: Retrieve the saved avatar
    console.log('📱 Test 3: Getting saved avatar...');
    const savedAvatar = await ProfileService.getUserAvatar();
    console.log('Saved avatar:', savedAvatar);
    
    // Test 4: Remove avatar (null)
    console.log('🗑️ Test 4: Removing avatar...');
    const removeResult = await ProfileService.saveUserAvatar(null);
    console.log('Remove result:', removeResult);
    
    // Test 5: Verify removal
    console.log('📱 Test 5: Verifying removal...');
    const removedAvatar = await ProfileService.getUserAvatar();
    console.log('After removal:', removedAvatar);
    
    console.log('✅ Avatar functionality test completed!');
    
  } catch (error) {
    console.error('❌ Avatar test failed:', error);
  }
}

// Also test the storage key directly
async function testStorageKey() {
  console.log('🔑 Testing storage key directly...');
  
  try {
    // Direct AsyncStorage test
    await AsyncStorage.setItem('user_avatar', 'test-direct-value');
    const directValue = await AsyncStorage.getItem('user_avatar');
    console.log('Direct storage test:', directValue);
    
    // Cleanup
    await AsyncStorage.removeItem('user_avatar');
    console.log('✅ Storage key test completed!');
    
  } catch (error) {
    console.error('❌ Storage key test failed:', error);
  }
}

export { testAvatarFunctionality, testStorageKey };
