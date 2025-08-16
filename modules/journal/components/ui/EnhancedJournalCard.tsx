import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useRef } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    interpolate,
    interpolateColor,
    runOnJS,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useAccessibilityProps, useReducedMotion, useScreenReaderAnnouncement } from '../../hooks/useAccessibility';
import { JournalEntry } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = SCREEN_WIDTH - (CARD_MARGIN * 2);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface EnhancedJournalCardProps {
  entry: JournalEntry;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  index: number;
  scrollY?: SharedValue<number>;
  isSelected?: boolean;
  showActions?: boolean;
}

/**
 * Enhanced journal entry card with animations, parallax, and accessibility
 */
export const EnhancedJournalCard: React.FC<EnhancedJournalCardProps> = ({
  entry,
  onPress,
  onEdit,
  onDelete,
  onShare,
  index,
  scrollY,
  isSelected = false,
  showActions = false,
}) => {
  const cardRef = useRef<View>(null);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const actionOpacity = useSharedValue(0);
  const announceToScreenReader = useScreenReaderAnnouncement();
  const isReducedMotion = useReducedMotion();

  const accessibilityProps = useAccessibilityProps({
    label: `Journal entry from ${formatDate(entry.createdAt)}`,
    hint: 'Double tap to open, swipe for actions',
    role: 'button',
    state: isSelected ? { selected: true } : undefined,
    actions: [
      { name: 'open', label: 'Open entry' },
      { name: 'edit', label: 'Edit entry' },
      { name: 'share', label: 'Share entry' },
      { name: 'delete', label: 'Delete entry' },
    ],
    onAction: (event) => {
      const actionName = event.nativeEvent.actionName;
      switch (actionName) {
        case 'open':
          handlePress();
          break;
        case 'edit':
          onEdit?.();
          break;
        case 'share':
          onShare?.();
          break;
        case 'delete':
          onDelete?.();
          break;
      }
    },
  });

  // Parallax effect based on scroll position
  const parallaxStyle = useAnimatedStyle(() => {
    if (!scrollY || isReducedMotion) return {};

    const inputRange = [
      (index - 1) * 200,
      index * 200,
      (index + 1) * 200,
    ];

    const translateY = interpolate(
      scrollY.value,
      inputRange,
      [50, 0, -50],
      'clamp'
    );

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.7, 1, 0.7],
      'clamp'
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  // Press animation
  const pressGesture = Gesture.Tap()
    .onBegin(() => {
      if (!isReducedMotion) {
        scale.value = withSpring(0.98);
      }
    })
    .onFinalize(() => {
      if (!isReducedMotion) {
        scale.value = withSpring(1);
      }
    })
    .onEnd(() => {
      runOnJS(handlePress)();
    });

  // Swipe gesture for actions
  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      const { translationX } = event;
      
      if (showActions) {
        translateX.value = Math.max(-120, Math.min(0, translationX));
        actionOpacity.value = interpolate(
          Math.abs(translateX.value),
          [0, 120],
          [0, 1],
          'clamp'
        );
      }
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      
      if (showActions && (Math.abs(translationX) > 60 || Math.abs(velocityX) > 500)) {
        translateX.value = withSpring(-120);
        actionOpacity.value = withTiming(1);
        runOnJS(announceToScreenReader)('Actions available: edit, share, delete');
      } else {
        translateX.value = withSpring(0);
        actionOpacity.value = withTiming(0);
      }
    });

  const handlePress = () => {
    announceToScreenReader(`Opening journal entry from ${formatDate(entry.createdAt)}`);
    onPress();
  };

  const handleActionPress = (action: string, callback?: () => void) => {
    announceToScreenReader(`${action} action selected`);
    callback?.();
    // Reset swipe state
    translateX.value = withSpring(0);
    actionOpacity.value = withTiming(0);
  };

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
    ],
  }));

  const actionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: actionOpacity.value,
  }));

  const selectionStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      isSelected ? 1 : 0,
      [0, 1],
      ['transparent', '#007AFF']
    );

    return {
      borderColor,
      borderWidth: isSelected ? 2 : 0,
    };
  });

  const combinedGesture = Gesture.Simultaneous(pressGesture, swipeGesture);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={combinedGesture}>
        <Animated.View
          ref={cardRef}
          style={[
            styles.cardContainer,
            parallaxStyle,
            cardAnimatedStyle,
            selectionStyle,
          ]}
          {...accessibilityProps}
        >
          <AnimatedPressable style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
                <Text style={styles.dateText}>{formatDate(entry.createdAt)}</Text>
                {entry.isFavorite && (
                  <Ionicons name="heart" size={16} color="#FF3B30" style={styles.favoriteIcon} />
                )}
              </View>
              
              {entry.sentimentScore !== undefined && (
                <View style={styles.sentimentContainer}>
                  <View style={[
                    styles.sentimentIndicator,
                    { backgroundColor: getSentimentColor(entry.sentimentScore) }
                  ]} />
                  <Text style={styles.sentimentText}>
                    {getSentimentLabel(entry.sentimentScore)}
                  </Text>
                </View>
              )}
            </View>

            {/* Content Preview */}
            <Text style={styles.contentPreview} numberOfLines={3}>
              {entry.content}
            </Text>

            {/* Mood Tags */}
            {entry.moodTags.length > 0 && (
              <View style={styles.moodTagsContainer}>
                {entry.moodTags.slice(0, 3).map((tag, tagIndex) => (
                  <View
                    key={tag.id}
                    style={[
                      styles.moodTag,
                      { backgroundColor: tag.hexColor + '20' }
                    ]}
                  >
                    <Text style={[styles.moodTagText, { color: tag.hexColor }]}>
                      {tag.emoji} {tag.label}
                    </Text>
                  </View>
                ))}
                {entry.moodTags.length > 3 && (
                  <Text style={styles.moreTagsText}>
                    +{entry.moodTags.length - 3} more
                  </Text>
                )}
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.metadataContainer}>
                {entry.wordCount && (
                  <Text style={styles.metadataText}>
                    {entry.wordCount} words
                  </Text>
                )}
                {entry.readingTimeMinutes && (
                  <Text style={styles.metadataText}>
                    • {entry.readingTimeMinutes} min read
                  </Text>
                )}
              </View>
              
              <View style={styles.privacyContainer}>
                <Ionicons
                  name={entry.privacy === 'private' ? 'lock-closed' : 'globe-outline'}
                  size={14}
                  color="#8E8E93"
                />
              </View>
            </View>

            {/* Gradient Overlay for long content */}
            {entry.content.length > 150 && (
              <BlurView intensity={20} style={styles.gradientOverlay}>
                <View style={styles.gradientMask} />
              </BlurView>
            )}
          </AnimatedPressable>
        </Animated.View>
      </GestureDetector>

      {/* Action Buttons */}
      {showActions && (
        <Animated.View style={[styles.actionsContainer, actionAnimatedStyle]}>
          {onEdit && (
            <Pressable
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleActionPress('Edit', onEdit)}
            >
              <Ionicons name="pencil" size={20} color="#FFFFFF" />
            </Pressable>
          )}
          
          {onShare && (
            <Pressable
              style={[styles.actionButton, styles.shareButton]}
              onPress={() => handleActionPress('Share', onShare)}
            >
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            </Pressable>
          )}
          
          {onDelete && (
            <Pressable
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleActionPress('Delete', onDelete)}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            </Pressable>
          )}
        </Animated.View>
      )}
    </View>
  );
};

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 168) { // 7 days
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

function getSentimentColor(score: number): string {
  if (score > 0.3) return '#34C759'; // Positive - Green
  if (score < -0.3) return '#FF3B30'; // Negative - Red
  return '#FF9500'; // Neutral - Orange
}

function getSentimentLabel(score: number): string {
  if (score > 0.3) return 'Positive';
  if (score < -0.3) return 'Challenging';
  return 'Neutral';
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: CARD_MARGIN,
    marginVertical: 8,
  },
  cardContainer: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
    fontWeight: '500',
  },
  favoriteIcon: {
    marginLeft: 8,
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentimentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  sentimentText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  contentPreview: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1C1C1E',
    marginBottom: 12,
  },
  moodTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  moodTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  moodTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#8E8E93',
    alignSelf: 'center',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadataContainer: {
    flexDirection: 'row',
  },
  metadataText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  gradientMask: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  shareButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
});
