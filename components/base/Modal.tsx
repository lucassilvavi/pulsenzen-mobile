import Typography from '@/components/base/Typography';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Dimensions, Modal as RNModal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Button from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdropPress?: boolean;
  showCloseButton?: boolean;
}

const Modal = ({
  visible,
  onClose,
  title,
  children,
  footer,
  closeOnBackdropPress = true,
  showCloseButton = true,
}: ModalProps) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={closeOnBackdropPress ? onClose : undefined}
          activeOpacity={1}
        />
        
        <View style={styles.container}>
          {title && (
            <View style={styles.header}>
              <Typography variant="h2" weight="semibold">
                {title}
              </Typography>
              
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Typography color={Colors.gray[500]}>✕</Typography>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          <View style={styles.content}>
            {children}
          </View>
          
          {footer && (
            <View style={styles.footer}>
              {footer}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

// Convenience component for simple confirmation dialogs
export const ConfirmationDialog = ({
  visible,
  onClose,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  confirmVariant = 'primary',
  isDestructive = false,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  confirmVariant?: 'primary' | 'secondary' | 'outline';
  isDestructive?: boolean;
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
    >
      <Typography style={styles.message}>
        {message}
      </Typography>
      
      <View style={styles.buttonContainer}>
        <Button
          label={cancelText}
          variant="outline"
          style={styles.button}
          onPress={onClose}
        />
        <Button
          label={confirmText}
          variant={confirmVariant}
          style={styles.button}
          onPress={() => {
            onConfirm();
            onClose();
          }}
        />
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  message: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  button: {
    marginLeft: 8,
    minWidth: 100,
  },
});

export default Modal;
