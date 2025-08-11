import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { useReducedMotion } from '@/hooks/useAccessibility';
import { fontSize, spacing } from '@/utils/responsive';
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Animated, Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { usePrediction } from '../context/PredictionContext';
import { track } from '../services/Telemetry';
import { InterventionSuggestion } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.74;

// Use Animated FlatList to allow native driver scroll events without warnings
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList as any);

export const InterventionsCarousel: React.FC = () => {
  const { interventions, markInterventionCompleted } = usePrediction();
  const scrollX = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  if (!interventions.length) return null;

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        data={interventions}
  keyExtractor={(i: InterventionSuggestion) => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + spacing.md}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
  renderItem={({ item, index }: { item: InterventionSuggestion; index: number }) => {
          const inputRange = [ (index-1)*(CARD_WIDTH+spacing.md), index*(CARD_WIDTH+spacing.md), (index+1)*(CARD_WIDTH+spacing.md) ];
          const scale = reduceMotion ? 1 : scrollX.interpolate({ inputRange, outputRange:[0.92,1,0.92], extrapolate:'clamp' });
          return (
            <Animated.View style={[styles.cardWrapper, { transform:[{ scale }] }]}>              
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.card, item.completed && styles.cardDone]}
                onPress={() => {
                  if (!item.completed) {
                    markInterventionCompleted(item.id);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                  track('prediction_intervention_expand', { id: item.id });
                }}
                accessibilityRole="button"
                accessibilityLabel={`Intervenção ${item.title}`}
              >
                <ThemedText style={styles.emoji}>{item.emoji}</ThemedText>
                <ThemedText style={styles.title}>{item.title}</ThemedText>
                <ThemedText style={styles.benefit}>{item.benefit}</ThemedText>
                {item.completed && (
                  <ThemedText style={styles.completed}>✔ Concluído</ThemedText>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container:{ marginBottom: spacing.lg },
  cardWrapper:{ width: CARD_WIDTH, marginRight: spacing.md },
  card:{ backgroundColor:'#F3F6F9', borderRadius:20, padding: spacing.lg, alignItems:'center', justifyContent:'center', minHeight:180 },
  cardDone:{ opacity:0.55, backgroundColor:'#E1E8EE' },
  emoji:{ fontSize:42, marginBottom: spacing.sm },
  title:{ fontFamily:'Inter-SemiBold', fontSize: fontSize.md, textAlign:'center', color: colors.neutral.text.primary, marginBottom: spacing.xs },
  benefit:{ fontFamily:'Inter-Regular', fontSize: fontSize.sm, textAlign:'center', color: colors.neutral.text.secondary },
  completed:{ marginTop: spacing.sm, fontFamily:'Inter-SemiBold', fontSize: fontSize.xs, color: colors.primary.main },
});
