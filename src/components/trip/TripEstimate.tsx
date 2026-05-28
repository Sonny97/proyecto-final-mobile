import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppRedux';
import { setEstimates } from '../../redux/slices/tripSlice';
import { getDirections, calculateFare } from '../../api/googleApis';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

interface TripEstimateProps {
  onEstimateCalculated?: (estimate: {
    price: number;
    duration: number;
    distance: number;
    polyline: string;
  }) => void;
}

const TripEstimate: React.FC<TripEstimateProps> = ({ onEstimateCalculated }) => {
  const dispatch = useAppDispatch();
  const { origin, destination } = useAppSelector((state) => state.location);
  const { selectedCategory, estimatedPrice, estimatedDuration, estimatedDistance } = useAppSelector(
    (state) => state.trip
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polyline, setPolyline] = useState<string>('');

  const calculateEstimates = useCallback(async () => {
    if (!origin || !destination) return;

    setIsLoading(true);
    setError(null);

    try {
      const directions = await getDirections(origin, destination);

      if (directions) {
        const distanceKm = directions.distance / 1000;
        const durationMinutes = directions.duration / 60;

        const price = calculateFare(distanceKm, durationMinutes, selectedCategory);

        dispatch(
          setEstimates({
            price,
            duration: directions.duration,
            distance: directions.distance,
          })
        );

        setPolyline(directions.polyline);

        onEstimateCalculated?.({
          price,
          duration: directions.duration,
          distance: directions.distance,
          polyline: directions.polyline,
        });
      } else {
        setError('No se pudo calcular la ruta');
      }
    } catch (err) {
      setError('Error al calcular el viaje');
      console.error('Error calculating estimates:', err);
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination, selectedCategory, dispatch, onEstimateCalculated]);

  useEffect(() => {
    calculateEstimates();
  }, [calculateEstimates]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.secondary} />
        <Text style={styles.loadingText}>Calculando ruta...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!estimatedPrice) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.estimateRow}>
        <View style={styles.estimateItem}>
          <Text style={styles.estimateIcon}>💰</Text>
          <View>
            <Text style={styles.estimateLabel}>Precio estimado</Text>
            <Text style={styles.estimateValue}>{formatPrice(estimatedPrice)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.estimateItem}>
          <Text style={styles.estimateIcon}>⏱️</Text>
          <View>
            <Text style={styles.estimateLabel}>Duración</Text>
            <Text style={styles.estimateValue}>{formatDuration(estimatedDuration)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.estimateItem}>
          <Text style={styles.estimateIcon}>📍</Text>
          <View>
            <Text style={styles.estimateLabel}>Distancia</Text>
            <Text style={styles.estimateValue}>{formatDistance(estimatedDistance)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        *El precio final puede variar según el tráfico y la ruta tomada
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  errorContainer: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estimateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimateIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  estimateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  estimateValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
});

export default TripEstimate;
