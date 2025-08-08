import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BiometricSettings } from '../components/biometric';
import { Colors } from '../constants/Colors';

const ProfileScreen: React.FC = () => {
  /**
   * Handle logout
   */
  const handleLogout = () => {
    // Implement logout logic
    console.log('Logout pressed');
  };

  /**
   * Handle other settings
   */
  const handleSettingPress = (setting: string) => {
    console.log(`${setting} pressed`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={Colors.white} />
        </View>
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john.doe@example.com</Text>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        {/* Biometric Settings Component */}
        <BiometricSettings style={styles.settingsCard} />
        
        {/* Other Security Settings */}
        <View style={styles.settingsCard}>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleSettingPress('Change Password')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed" size={24} color={Colors.gray[600]} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingDescription}>
                  Update your account password
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleSettingPress('Two-Factor Authentication')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.gray[600]} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                <Text style={styles.settingDescription}>
                  Add an extra layer of security
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* App Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingsCard}>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleSettingPress('Notifications')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={24} color={Colors.gray[600]} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Manage notification preferences
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleSettingPress('Privacy')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="eye-off" size={24} color={Colors.gray[600]} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Privacy</Text>
                <Text style={styles.settingDescription}>
                  Control your privacy settings
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleSettingPress('Language')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="language" size={24} color={Colors.gray[600]} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Language</Text>
                <Text style={styles.settingDescription}>
                  Choose your preferred language
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <View style={styles.settingsCard}>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleSettingPress('Help Center')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle" size={24} color={Colors.gray[600]} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Help Center</Text>
                <Text style={styles.settingDescription}>
                  Get help and support
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleSettingPress('Contact Us')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="mail" size={24} color={Colors.gray[600]} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Contact Us</Text>
                <Text style={styles.settingDescription}>
                  Send us a message
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color={Colors.red[600]} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: Colors.white,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.gray[600],
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginLeft: 52,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.red[100],
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.red[600],
  },
});

export default ProfileScreen;
