import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

interface CustomSliderProps {
  style?: ViewStyle;
  value: number; // 0 to 1
  onSlidingComplete?: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbColor?: string;
  disabled?: boolean;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  style,
  value,
  onSlidingComplete,
  minimumTrackTintColor = '#007AFF',
  maximumTrackTintColor = '#E0E0E0',
  thumbColor = '#007AFF',
  disabled = false,
}) => {
  const sliderWidth = 300;
  const thumbSize = 20;
  
  const progress = useSharedValue(value);
  const isDragging = useSharedValue(false);

  React.useEffect(() => {
    if (!isDragging.value) {
      progress.value = value;
    }
  }, [value, isDragging.value, progress]);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      isDragging.value = true;
    },
    onActive: (event) => {
      const newProgress = Math.max(0, Math.min(1, event.x / sliderWidth));
      progress.value = newProgress;
    },
    onEnd: () => {
      isDragging.value = false;
      if (onSlidingComplete) {
        runOnJS(onSlidingComplete)(progress.value);
      }
    },
  });

  const trackStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    left: progress.value * sliderWidth - thumbSize / 2,
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]}>
        <Animated.View style={[styles.progressTrack, { backgroundColor: minimumTrackTintColor }, trackStyle]} />
      </View>
      
      {!disabled && (
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.thumb, { backgroundColor: thumbColor }, thumbStyle]} />
        </PanGestureHandler>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: 'relative',
  },
  progressTrack: {
    height: '100%',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: '50%',
    marginTop: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default CustomSlider;
