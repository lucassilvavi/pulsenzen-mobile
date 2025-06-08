import { Colors } from '@/constants/Colors';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'label';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: 'normal' | 'bold' | 'semibold' | 'medium';
}

const Typography = ({ 
  children, 
  variant = 'body', 
  color, 
  style, 
  align = 'auto',
  weight,
  ...props 
}: TextProps) => {
  const getWeightStyle = () => {
    switch (weight) {
      case 'bold':
        return { fontWeight: '700' };
      case 'semibold':
        return { fontWeight: '600' };
      case 'medium':
        return { fontWeight: '500' };
      default:
        return {};
    }
  };

  return (
    <RNText 
      style={[
        styles[variant], 
        color ? { color } : {},
        align ? { textAlign: align } : {},
      ]} 
      {...props}
    >
      {children}
    </RNText>
  );
};

// Convenience components
export const H1 = (props: TextProps) => <Typography variant="h1" weight="bold" {...props} />;
export const H2 = (props: TextProps) => <Typography variant="h2" weight="semibold" {...props} />;
export const H3 = (props: TextProps) => <Typography variant="h3" weight="semibold" {...props} />;
export const Body = (props: TextProps) => <Typography variant="body" {...props} />;
export const BodySmall = (props: TextProps) => <Typography variant="bodySmall" {...props} />;
export const Label = (props: TextProps) => <Typography variant="label" weight="medium" {...props} />;

const styles = StyleSheet.create({
  h1: {
    fontSize: 24,
    lineHeight: 32,
    color: Colors.primary[900],
  },
  h2: {
    fontSize: 18,
    lineHeight: 28,
    color: Colors.primary[800],
  },
  h3: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.primary[800],
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.gray[700],
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.gray[600],
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.gray[700],
  },
});

export default Typography;
