import Button from '@/components/base/Button';
import CustomTextInput from '@/components/base/CustomTextInput';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (text: string) => void;
  buttonLabel: string;
  onButtonPress: () => void;
  style?: ViewStyle;
};
export default function SearchAndActionBar({
  searchPlaceholder = 'Pesquisar...',
  searchValue,
  onSearchChange,
  buttonLabel,
  onButtonPress,
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputWrapper}>
        <CustomTextInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChangeText={onSearchChange}
          inputStyle={[styles.searchInput, { paddingLeft: 12 }] as any}
          leftIcon={<IconSymbol name="magnifyingglass" size={20} color="#757575" />}
        />
      </View>
      <Button
        variant="primary"
        style={styles.iconOnlyButton}
        onPress={onButtonPress}
        leftIcon={<IconSymbol name="plus" size={20} color="#FFF" />}
        label=""
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 0,
  },
  inputWrapper: {
    flex: 1,
    marginRight: 12,
    alignSelf: 'stretch',
  },
  searchInput: {
    height: 48,
    borderRadius: 16,
    fontSize: 18,
    backgroundColor: '#FAFAFA',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    paddingVertical: 0,
  },
  iconOnlyButton: {
    height: 48,
    width: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    alignSelf: 'stretch',
  },
});