import { ThemedText } from '@/components/ThemedText';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  prompt?: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: 'gratitude' | 'reflection' | 'challenge' | 'freewriting' | 'mood' | 'goal';
  estimatedTime: number; // em minutos
}

interface QuickActionCardProps {
  action: QuickAction;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

const { width } = Dimensions.get('window');

export function QuickActionCard({ action, onPress, size = 'medium' }: QuickActionCardProps) {
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'gratitude':
        return {
          colors: ['#f093fb', '#f5576c'],
          iconColor: 'white',
          textColor: 'white',
          shadowColor: '#f093fb',
        };
      case 'reflection':
        return {
          colors: ['#4facfe', '#00f2fe'],
          iconColor: 'white',
          textColor: 'white',
          shadowColor: '#4facfe',
        };
      case 'challenge':
        return {
          colors: ['#43e97b', '#38f9d7'],
          iconColor: 'white',
          textColor: 'white',
          shadowColor: '#43e97b',
        };
      case 'freewriting':
        return {
          colors: ['#667eea', '#764ba2'],
          iconColor: 'white',
          textColor: 'white',
          shadowColor: '#667eea',
        };
      case 'mood':
        return {
          colors: ['#fa709a', '#fee140'],
          iconColor: 'white',
          textColor: 'white',
          shadowColor: '#fa709a',
        };
      case 'goal':
        return {
          colors: ['#a8edea', '#fed6e3'],
          iconColor: '#333',
          textColor: '#333',
          shadowColor: '#a8edea',
        };
      default:
        return {
          colors: ['#e0e0e0', '#bdbdbd'],
          iconColor: '#333',
          textColor: '#333',
          shadowColor: '#e0e0e0',
        };
    }
  };

  const getSizeConfig = (size: string) => {
    const cardSpacing = spacing.md;
    const containerWidth = width - (spacing.lg * 2);
    
    switch (size) {
      case 'small':
        return {
          width: (containerWidth - cardSpacing) / 2,
          height: 100,
          iconSize: 20,
          titleSize: fontSize.sm,
          subtitleSize: fontSize.xs,
          padding: spacing.sm,
        };
      case 'large':
        return {
          width: containerWidth,
          height: 140,
          iconSize: 32,
          titleSize: fontSize.lg,
          subtitleSize: fontSize.sm,
          padding: spacing.lg,
        };
      default: // medium
        return {
          width: (containerWidth - cardSpacing) / 2,
          height: 120,
          iconSize: 24,
          titleSize: fontSize.md,
          subtitleSize: fontSize.sm,
          padding: spacing.md,
        };
    }
  };

  const config = getCategoryConfig(action.category);
  const sizeConfig = getSizeConfig(size);

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        {
          width: sizeConfig.width,
          height: sizeConfig.height,
          shadowColor: config.shadowColor,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={config.colors as [string, string]}
        style={[styles.gradient, { padding: sizeConfig.padding }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header com ícone e tempo estimado */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={action.icon} 
              size={sizeConfig.iconSize} 
              color={config.iconColor} 
            />
          </View>
          
          <View style={styles.timeContainer}>
            <ThemedText style={[styles.timeText, { color: config.textColor }]}>
              {action.estimatedTime}min
            </ThemedText>
          </View>
        </View>

        {/* Conteúdo principal */}
        <View style={styles.content}>
          <ThemedText 
            style={[
              styles.title,
              { 
                color: config.textColor,
                fontSize: sizeConfig.titleSize,
              }
            ]}
            numberOfLines={2}
          >
            {action.title}
          </ThemedText>
          
          <ThemedText 
            style={[
              styles.subtitle,
              { 
                color: config.textColor,
                fontSize: sizeConfig.subtitleSize,
              }
            ]}
            numberOfLines={size === 'large' ? 3 : 2}
          >
            {action.subtitle}
          </ThemedText>
        </View>

        {/* Prompt preview (apenas para cards grandes) */}
        {size === 'large' && action.prompt && (
          <View style={styles.promptContainer}>
            <ThemedText style={[styles.promptText, { color: config.textColor }]}>
              "{action.prompt}"
            </ThemedText>
          </View>
        )}

        {/* Decorações visuais */}
        <View style={[styles.decorativeDot, { backgroundColor: config.textColor }]} />
        <View style={[styles.decorativeCircle, { borderColor: config.textColor }]} />
        
        {/* Indicador de ação */}
        <View style={styles.actionIndicator}>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={config.textColor}
            style={{ opacity: 0.7 }}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  timeText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    marginBottom: spacing.xs,
    lineHeight: fontSize.md * 1.2,
  },
  subtitle: {
    fontWeight: '400',
    opacity: 0.9,
    lineHeight: fontSize.sm * 1.3,
  },
  promptContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  promptText: {
    fontSize: fontSize.xs,
    fontStyle: 'italic',
    opacity: 0.8,
    lineHeight: fontSize.xs * 1.3,
  },
  decorativeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  decorativeCircle: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    opacity: 0.2,
  },
  actionIndicator: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
});
