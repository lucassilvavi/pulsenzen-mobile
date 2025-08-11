import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Animated, Easing, StyleSheet, View, Text, AccessibilityInfo } from 'react-native';
import { colors } from '@/constants/theme';

interface ToastOptions { type?: 'info' | 'success' | 'warning' | 'error'; duration?: number; }
interface ToastItem { id: number; message: string; type: ToastOptions['type']; }
interface ToastContextValue { show: (message: string, options?: ToastOptions) => void; }

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const opacity = useRef(new Animated.Value(0)).current;

  const show = useCallback((message: string, options?: ToastOptions) => {
  const item: ToastItem = { id: Date.now(), message, type: options?.type || 'info' };
    setQueue(q => [...q, item]);
  AccessibilityInfo.isScreenReaderEnabled().then(enabled => { if(enabled) AccessibilityInfo.announceForAccessibility(message); });
  }, []);

  useEffect(() => {
    if (!queue.length) return;
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.ease) }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setQueue(q => q.slice(1));
      });
    },  (queue[0].message.length > 40 ? 5000 : 3500));
    return () => clearTimeout(timer);
  }, [queue, opacity]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {queue.length > 0 && (
        <Animated.View style={[styles.container, { opacity }]}>          
          {(() => { const t = queue[0]; const pal = (colors.toast as any)[t.type||'info']; return (
            <View style={[styles.toast, { backgroundColor: pal.bg }]}>            
              <Text style={[styles.text, { color: pal.fg }]}>{t.message}</Text>
            </View>
          ); })()}
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export function useToast(){
  const ctx = useContext(ToastContext);
  if(!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container:{ position:'absolute', bottom: 30, left:0, right:0, alignItems:'center', pointerEvents:'none' },
  toast:{ maxWidth:'86%', paddingHorizontal:16, paddingVertical:12, borderRadius:14, shadowColor:'#000', shadowOpacity:0.18, shadowRadius:12, shadowOffset:{ width:0, height:4 } },
  text:{ fontFamily:'Inter-Medium' }
});
