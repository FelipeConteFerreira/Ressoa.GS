import { useEffect, useState, type ReactNode } from 'react';
import { Animated, type ViewStyle } from 'react-native';

interface FadeInViewProps {
  children: ReactNode;
  /** Atraso em ms, para os blocos entrarem em sequência. */
  delay?: number;
  style?: ViewStyle;
}

/** Faz o conteúdo surgir com um leve deslize para cima. */
export function FadeInView({ children, delay = 0, style }: FadeInViewProps) {
  const [progresso] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progresso, {
      toValue: 1,
      duration: 380,
      delay,
      useNativeDriver: true,
    }).start();
  }, [progresso, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progresso,
          transform: [
            { translateY: progresso.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
