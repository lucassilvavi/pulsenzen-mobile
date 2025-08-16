import Button from '@/components/base/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

type Props = {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (text: string) => void;
  buttonLabel: string;
  onButtonPress: () => void;
  style?: ViewStyle;
  isSearching?: boolean;
  searchResultsCount?: number;
  showSearchTips?: boolean;
};

export default function SearchAndActionBar({
  searchPlaceholder = 'Pesquisar diários...',
  searchValue,
  onSearchChange,
  buttonLabel,
  onButtonPress,
  style,
  isSearching = false,
  searchResultsCount = 0,
  showSearchTips = false,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: isFocused || hasSearchValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, searchValue]);

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const hasSearchValue = searchValue.trim().length > 0;

  const animatedBorderColor = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.neutral.divider, colors.journal.accent],
  });

  const animatedShadowOpacity = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.06, 0.12],
  });

  const getSearchStatusText = () => {
    if (isSearching) return 'Pesquisando...';
    if (hasSearchValue && searchResultsCount === 0) return 'Nenhum resultado encontrado';
    if (hasSearchValue && searchResultsCount > 0) {
      return `${searchResultsCount} resultado${searchResultsCount > 1 ? 's' : ''} encontrado${searchResultsCount > 1 ? 's' : ''}`;
    }
    return '';
  };

  const getSearchTipsText = () => {
    if (!showSearchTips || hasSearchValue) return '';
    return '💡 Pesquise por conteúdo, categoria, humor ou data';
  };

  return (
    <View style={[styles.container, style]}>
      {/* Linha principal com input e botão */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Animated.View style={[
            styles.inputWrapper,
            { 
              borderColor: animatedBorderColor,
              shadowOpacity: animatedShadowOpacity,
            },
            isFocused && styles.inputWrapperFocused,
            hasSearchValue && styles.inputWrapperWithValue,
          ]}>
            <View style={styles.inputContent}>
              {/* Ícone à esquerda */}
              <View style={styles.leftIconContainer}>
                {isSearching ? (
                  <ActivityIndicator size="small" color={colors.journal.accent} />
                ) : (
                  <Ionicons 
                    name="search" 
                    size={20} 
                    color={isFocused || hasSearchValue ? colors.journal.accent : colors.neutral.text.secondary} 
                  />
                )}
              </View>
              
              {/* Input de texto */}
              <TextInput
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.neutral.text.hint}
                value={searchValue}
                onChangeText={onSearchChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={styles.searchInput}
              />
              
              {/* Botão de limpar */}
              {hasSearchValue && !isSearching && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearSearch}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={18} color={colors.neutral.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </View>
        
        <Button
          variant="primary"
          style={styles.iconOnlyButton}
          onPress={onButtonPress}
          leftIcon={<IconSymbol name="plus" size={20} color="#FFF" />}
          label=""
        />
      </View>

      {/* Status e dicas de pesquisa */}
      {(getSearchStatusText() || getSearchTipsText()) && (
        <View style={styles.searchStatusContainer}>
          {getSearchStatusText() && (
            <Text style={[
              styles.searchStatusText,
              hasSearchValue && searchResultsCount === 0 && styles.noResultsText
            ]}>
              {isSearching && '🔍 '}
              {hasSearchValue && searchResultsCount > 0 && '✅ '}
              {hasSearchValue && searchResultsCount === 0 && '❌ '}
              {getSearchStatusText()}
            </Text>
          )}
          {getSearchTipsText() && (
            <Text style={styles.searchTipsText}>
              {getSearchTipsText()}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  searchContainer: {
    flex: 1,
  },
  inputWrapper: {
    position: 'relative',
    borderWidth: 1.5,
    borderRadius: 14,
    borderColor: colors.neutral.divider,
    backgroundColor: colors.neutral.white,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: colors.journal.accent,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  inputWrapperWithValue: {
    borderColor: colors.journal.accent,
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  leftIconContainer: {
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
    backgroundColor: 'transparent',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  clearButton: {
    paddingRight: spacing.sm,
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  searchStatusContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.neutral.background,
    borderRadius: 10,
    marginTop: spacing.xs,
  },
  searchStatusText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 18,
  },
  noResultsText: {
    color: colors.warning.main,
    fontFamily: 'Inter-SemiBold',
  },
  searchTipsText: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.hint,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  iconOnlyButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 0,
    alignSelf: 'center',
    shadowColor: colors.journal.accent,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});