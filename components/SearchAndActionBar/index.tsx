import Button from '@/components/base/Button';
import TextInput from '@/components/base/TextInput';
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
        <TextInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChangeText={onSearchChange}
          style={styles.searchInput}
          leftIcon={<IconSymbol name="magnifyingglass" size={20} color="#757575" />}
          // Remover paddingLeft extra para alinhar texto ao início
          inputStyle={{ paddingLeft: 12 }}
        />
      </View>
      <Button
        variant="primary"
        style={styles.iconButton}
        onPress={onButtonPress}
        leftIcon={<IconSymbol name="edit" size={24} color="#FFF" />} // Exemplo de ícone, pode trocar depois
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    flex: 1,
    marginRight: 12,
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
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#2196F3',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});