import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
    EnhancedButton,
    EnhancedJournalCard,
    EnhancedLoadingIndicator,
    EnhancedModal,
    EnhancedProgressBar,
    EnhancedStatsCard,
    EnhancedTextInput,
    MoodChart,
    useFadeAnimation,
    useHaptics,
    useScaleAnimation,
} from '../components/ui';

/**
 * Example implementation of enhanced UI components
 * This demonstrates how to use the new component library
 */
export const UIComponentShowcase: React.FC = () => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [progress, setProgress] = React.useState(65);
  
  const haptics = useHaptics();
  const { animatedStyle: fadeStyle, fadeIn, fadeOut } = useFadeAnimation(1);
  const { animatedStyle: scaleStyle, scalePress } = useScaleAnimation();

  // Mock data for demonstrations
  const moodData = [
    { day: 'Mon', mood: 4, color: '#4CAF50' },
    { day: 'Tue', mood: 3, color: '#FFC107' },
    { day: 'Wed', mood: 5, color: '#4CAF50' },
    { day: 'Thu', mood: 2, color: '#FF9800' },
    { day: 'Fri', mood: 4, color: '#4CAF50' },
    { day: 'Sat', mood: 5, color: '#4CAF50' },
    { day: 'Sun', mood: 3, color: '#FFC107' },
  ];

  const journalEntry = {
    id: '1',
    title: 'Amazing Day at the Beach',
    content: 'Today was such a wonderful day. The sun was shining, and I felt grateful for all the beautiful moments.',
    mood: 5,
    tags: ['gratitude', 'nature', 'happiness'],
    createdAt: new Date(),
    sentiment: 'positive' as const,
    wordCount: 156,
  };

  const handleButtonPress = async () => {
    await haptics.success();
    scalePress();
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>🎨 Enhanced UI Components</Text>
      
      {/* Buttons Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interactive Buttons</Text>
        
        <EnhancedButton
          title="Primary Action"
          variant="primary"
          size="large"
          onPress={handleButtonPress}
          accessibilityLabel="Primary action button"
        />
        
        <EnhancedButton
          title="Secondary Action"
          variant="secondary"
          size="medium"
          onPress={() => haptics.light()}
          style={{ marginTop: 12 }}
        />
        
        <EnhancedButton
          title="Loading State"
          variant="success"
          size="medium"
          loading={true}
          style={{ marginTop: 12 }}
        />
      </View>

      {/* Input Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enhanced Inputs</Text>
        
        <EnhancedTextInput
          label="Journal Title"
          placeholder="What's on your mind today?"
          value={inputValue}
          onChangeText={setInputValue}
          multiline={false}
          accessibilityLabel="Journal entry title input"
        />
        
        <EnhancedTextInput
          label="Journal Content"
          placeholder="Share your thoughts and feelings..."
          multiline={true}
          numberOfLines={4}
          style={{ marginTop: 16 }}
          accessibilityLabel="Journal entry content input"
        />
      </View>

      {/* Progress and Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress & Analytics</Text>
        
        <EnhancedProgressBar
          progress={progress}
          label="Writing Goal"
          showPercentage={true}
          variant="primary"
          size="medium"
        />
        
        <View style={styles.statsGrid}>
          <EnhancedStatsCard
            title="Total Entries"
            value="42"
            trend="up"
            trendValue="+3 this week"
            variant="primary"
            icon={<Text style={styles.statsIcon}>📝</Text>}
            style={styles.statsCard}
          />
          
          <EnhancedStatsCard
            title="Streak Days"
            value="15"
            trend="up"
            trendValue="+2 days"
            variant="success"
            icon={<Text style={styles.statsIcon}>🔥</Text>}
            style={styles.statsCard}
          />
        </View>
        
        <MoodChart data={moodData} title="This Week's Mood" />
      </View>

      {/* Journal Card Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Journal Entry Card</Text>
        
        <EnhancedJournalCard
          entry={journalEntry}
          onPress={() => haptics.selection()}
          onEdit={() => haptics.medium()}
          onDelete={() => haptics.error()}
          accessibilityLabel={`Journal entry: ${journalEntry.title}`}
        />
      </View>

      {/* Loading States Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loading States</Text>
        
        <View style={styles.loadingGrid}>
          <EnhancedLoadingIndicator type="spinner" size="small" />
          <EnhancedLoadingIndicator type="dots" size="medium" />
          <EnhancedLoadingIndicator type="pulse" size="large" />
        </View>
        
        <EnhancedLoadingIndicator
          type="skeleton"
          text="Loading your journal entries..."
          style={{ marginTop: 16 }}
        />
      </View>

      {/* Modal */}
      <EnhancedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Modal Example"
        size="medium"
        position="center"
      >
        <Text style={styles.modalText}>
          This is an example of the enhanced modal component with gesture support!
        </Text>
        
        <EnhancedButton
          title="Close Modal"
          variant="primary"
          onPress={() => setModalVisible(false)}
          style={{ marginTop: 16 }}
        />
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsIcon: {
    fontSize: 20,
  },
  loadingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 24,
  },
});
