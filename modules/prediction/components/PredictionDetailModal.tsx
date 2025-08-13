import { getRiskPalette } from '@/constants/theme';
import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { usePrediction } from '../context/PredictionContext';
import { PredictionDetailContent } from './PredictionDetailContent';

interface Props { visible: boolean; onClose: () => void; }

export const PredictionDetailModal: React.FC<Props> = ({ visible, onClose }) => {
  const { current, factors, interventions } = usePrediction();
  if (!current) return null;
  getRiskPalette(current.level); // palette currently only used inside content component
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <PredictionDetailContent onClose={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex:1, backgroundColor:'rgba(0,0,0,0.18)', justifyContent:'flex-end' },
});
