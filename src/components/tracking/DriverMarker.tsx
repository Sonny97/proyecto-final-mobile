import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Marker } from 'react-native-maps';
import { colors } from '../../theme';

interface DriverMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  heading?: number;
  isAnimated?: boolean;
}

const DriverMarker: React.FC<DriverMarkerProps> = ({
  coordinate,
  heading = 0,
  isAnimated = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAnimated) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    }
  }, [isAnimated, pulseAnim]);

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      flat
      rotation={heading}
    >
      <View style={styles.container}>
        {/* Pulse Effect */}
        <Animated.View
          style={[
            styles.pulse,
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.2],
                outputRange: [0.4, 0],
              }),
            },
          ]}
        />
        
        {/* Car Icon */}
        <View style={styles.carContainer}>
          <View style={styles.carBody}>
            <View style={styles.carTop} />
            <View style={styles.carWindows}>
              <View style={styles.carWindow} />
              <View style={styles.carWindow} />
            </View>
          </View>
          <View style={styles.carWheels}>
            <View style={styles.wheel} />
            <View style={styles.wheel} />
          </View>
        </View>

        {/* Direction Arrow */}
        <View style={styles.arrowContainer}>
          <View style={styles.arrow} />
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
  },
  carContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: colors.textWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  carBody: {
    width: 16,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carTop: {
    width: 12,
    height: 6,
    backgroundColor: colors.textWhite,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  carWindows: {
    flexDirection: 'row',
    width: 16,
    height: 8,
    backgroundColor: colors.textWhite,
    borderRadius: 2,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  carWindow: {
    width: 5,
    height: 4,
    backgroundColor: colors.secondary,
    borderRadius: 1,
  },
  carWheels: {
    flexDirection: 'row',
    width: 20,
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 2,
  },
  wheel: {
    width: 4,
    height: 4,
    backgroundColor: colors.textLight,
    borderRadius: 2,
  },
  arrowContainer: {
    position: 'absolute',
    top: -2,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.secondary,
  },
});

export default DriverMarker;
