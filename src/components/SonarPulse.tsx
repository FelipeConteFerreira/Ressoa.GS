import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const ONDAS = 3;
const DURACAO = 2400;

interface SonarPulseProps {
  /** Cor das ondas (a do nível de risco). */
  color: string;
  /** Diâmetro do círculo central. */
  size?: number;
  children: ReactNode;
}

/**
 * Ondas que saem do centro em loop, como o pulso de ultrassom do aparelho Ressoa.
 * Feito só com Animated do React Native, sem bibliotecas extras.
 */
export function SonarPulse({ color, size = 120, children }: SonarPulseProps) {
  const [ondas] = useState(() => Array.from({ length: ONDAS }, () => new Animated.Value(0)));

  useEffect(() => {
    const animacoes = ondas.map((onda, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay((DURACAO / ONDAS) * i),
          Animated.timing(onda, {
            toValue: 1,
            duration: DURACAO,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    animacoes.forEach((a) => a.start());
    return () => animacoes.forEach((a) => a.stop());
  }, [ondas]);

  const area = size * 2;

  return (
    <View style={[styles.area, { width: area, height: area }]}>
      {ondas.map((onda, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            styles.onda,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: color,
              opacity: onda.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
              transform: [{ scale: onda.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }) }],
            },
          ]}
        />
      ))}
      <View
        style={[
          styles.centro,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  onda: { position: 'absolute', borderWidth: 3 },
  centro: { alignItems: 'center', justifyContent: 'center' },
});
