import React from 'react';
import { Text, View } from 'react-native';
import { render, act } from '@testing-library/react-native';
import { ToastProvider, useToast } from '@/modules/ui/toast/ToastContext';

// Componente de ajuda para disparar toasts
const Fire: React.FC = () => {
  const toast = useToast();
  return (
    <View>
      <Text testID="btnA" onPress={() => toast.show('Primeiro')}>A</Text>
      <Text testID="btnB" onPress={() => toast.show('Segundo longo texto que força timeout maior')}>B</Text>
      <Text testID="btnDismiss" onPress={() => toast.dismiss()}>D</Text>
    </View>
  );
};

const setup = () => render(<ToastProvider><Fire /></ToastProvider>);

describe('ToastContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('enfileira e exibe primeiro toast (FIFO)', () => {
    const { getByTestId, getByText, queryByText } = setup();
    act(() => { getByTestId('btnA').props.onPress(); });
    expect(getByText('Primeiro')).toBeTruthy();
    act(() => { getByTestId('btnB').props.onPress(); });
    // Segundo ainda não visível
    expect(queryByText('Segundo longo texto que força timeout maior')).toBeNull();
  });

  it('faz auto-dismiss e mostra próximo da fila', () => {
    const { getByTestId, getByText } = setup();
    act(() => { getByTestId('btnA').props.onPress(); });
    act(() => { getByTestId('btnB').props.onPress(); });
    expect(getByText('Primeiro')).toBeTruthy();
    // Avança tempo menor (Primeiro tem < 40 chars => 3500ms + animações ~380ms). Usamos 4000ms para segurança.
    act(() => { jest.advanceTimersByTime(4000); });
    expect(getByText('Segundo longo texto que força timeout maior')).toBeTruthy();
  });

  it('permite dismiss manual do toast atual', () => {
    const { getByTestId, getByText, queryByText } = setup();
    act(() => { getByTestId('btnA').props.onPress(); });
    expect(getByText('Primeiro')).toBeTruthy();
    act(() => { getByTestId('btnDismiss').props.onPress(); });
    // Animação 200ms; avançar
    act(() => { jest.advanceTimersByTime(250); });
    expect(queryByText('Primeiro')).toBeNull();
  });

  it('ajusta timeout maior para mensagens longas', () => {
    const { getByTestId, getByText } = setup();
    act(() => { getByTestId('btnB').props.onPress(); });
    expect(getByText('Segundo longo texto que força timeout maior')).toBeTruthy();
    // Antes de 5000ms ainda deve estar presente
    act(() => { jest.advanceTimersByTime(4800); });
    expect(getByText('Segundo longo texto que força timeout maior')).toBeTruthy();
    act(() => { jest.advanceTimersByTime(400); }); // total 5200ms incluindo animação
  });
});
