import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

interface AvatarPickerProps {
  currentImage?: string;
  onImageSelected: (imageUri: string | null) => void;
  size?: number;
  showEditButton?: boolean;
}

export function AvatarPicker({ 
  currentImage, 
  onImageSelected, 
  size = 100, 
  showEditButton = true 
}: AvatarPickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
      Alert.alert(
        'Permissões necessárias',
        'Precisamos de acesso à câmera e galeria para alterar sua foto de perfil.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const showImageOptions = () => {
    Alert.alert(
      'Alterar foto de perfil',
      'Escolha uma opção:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Câmera', onPress: () => openCamera() },
        { text: 'Galeria', onPress: () => openGallery() },
        ...(currentImage ? [{ text: 'Remover foto', style: 'destructive' as const, onPress: () => removeImage() }] : []),
      ]
    );
  };

  const openCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('📷 Nova foto selecionada da câmera:', result.assets[0].uri);
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao abrir câmera:', error);
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    } finally {
      setIsLoading(false);
    }
  };

  const openGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('📷 Nova foto selecionada da galeria:', result.assets[0].uri);
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao abrir galeria:', error);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    onImageSelected(null);
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <TouchableOpacity 
        style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}
        onPress={showImageOptions}
        disabled={isLoading}
      >
        <Image
          source={currentImage || require('@/assets/images/profile-placeholder.png')}
          style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
          contentFit="cover"
        />
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ThemedText style={styles.loadingText}>...</ThemedText>
          </View>
        )}
      </TouchableOpacity>

      {showEditButton && (
        <TouchableOpacity 
          style={[styles.editButton, { bottom: size * 0.05, right: size * 0.05 }]}
          onPress={showImageOptions}
          disabled={isLoading}
        >
          <Ionicons name="camera" size={16} color={colors.neutral.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatarContainer: {
    overflow: 'hidden',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  loadingText: {
    color: colors.neutral.white,
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
  },
});