import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EnhancedButton } from '../components/ui/EnhancedButton';
import { EnhancedProgressBar, EnhancedStatsCard } from '../components/ui/EnhancedCharts';
import { EnhancedLoadingIndicator } from '../components/ui/EnhancedLoadingIndicator';
import { EnhancedModal } from '../components/ui/EnhancedModal';
import { EnhancedTextInput } from '../components/ui/EnhancedTextInput';
import { useHaptics } from '../utils/hapticManager';

/**
 * Simple example showing the enhanced UI components
 */
export const SimpleUIExample: React.FC = () => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  const haptics = useHaptics();

  const handleButtonPress = async () => {
    await haptics.success();
    setModalVisible(true);
  };

  const simulateLoading = async () => {
    setLoading(true);
    await haptics.medium();
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>🎨 Enhanced Components Demo</Text>
      
      {/* Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enhanced Buttons</Text>
        
        <EnhancedButton
          title="Open Modal"
          variant="primary"
          size="large"
          onPress={handleButtonPress}
        />
        
        <View style={styles.spacer} />
        
        <EnhancedButton
          title="Simulate Loading"
          variant="secondary"
          size="medium"
          onPress={simulateLoading}
        />
        
        <View style={styles.spacer} />
        
        <EnhancedButton
          title="Danger Action"
          variant="danger"
          size="medium"
          onPress={() => haptics.error()}
        />
      </View>

      {/* Text Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enhanced Text Input</Text>
        
        <EnhancedTextInput
          label="Your Message"
          placeholder="Type something here..."
          value={inputValue}
          onChangeText={setInputValue}
        />
      </View>

      {/* Progress Bar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Indicator</Text>
        
        <EnhancedProgressBar
          progress={75}
          label="Daily Goal"
          showPercentage={true}
          variant="primary"
        />
      </View>

      {/* Stats Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats Cards</Text>
        
        <EnhancedStatsCard
          title="Total Entries"
          value="42"
          trend="up"
          trendValue="+5 this week"
          variant="primary"
        />
        
        <View style={styles.spacer} />
        
        <EnhancedStatsCard
          title="Current Streak"
          value="7 days"
          trend="up"
          variant="success"
        />
      </View>

      {/* Loading Indicator */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loading States</Text>
        
        {loading && (
          <EnhancedLoadingIndicator
            visible={true}
            type="dots"
            size="medium"
          />
        )}
        
        {!loading && (
          <Text style={styles.infoText}>
            Press "Simulate Loading" to see the loading indicator
          </Text>
        )}
      </View>

      {/* Modal */}
      <EnhancedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Demo Modal"
        size="medium"
        position="center"
      >
        <Text style={styles.modalText}>
          This is a demonstration of the enhanced modal component!
        </Text>
        
        <View style={styles.modalButtons}>
          <EnhancedButton
            title="Close"
            variant="secondary"
            onPress={() => setModalVisible(false)}
          />
        </View>
      </EnhancedModal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 16,
  },
  spacer: {
    height: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalButtons: {
    alignItems: 'center',
  },
});
