import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { setSelectedCategory } from '../../redux/slices/tripSlice';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

type VehicleCategory = 'economic' | 'xl' | 'premium';

interface VehicleOption {
  id: VehicleCategory;
  name: string;
  description: string;
  icon: string;
  passengers: number;
  multiplier: number;
}

const vehicleOptions: VehicleOption[] = [
  {
    id: 'economic',
    name: 'UberX',
    description: 'Viajes económicos y cotidianos',
    icon: '🚗',
    passengers: 4,
    multiplier: 1,
  },
  {
    id: 'xl',
    name: 'UberXL',
    description: 'Viajes para grupos de hasta 6',
    icon: '🚙',
    passengers: 6,
    multiplier: 1.5,
  },
  {
    id: 'premium',
    name: 'Black',
    description: 'Viajes premium con conductores top',
    icon: '🚘',
    passengers: 4,
    multiplier: 2,
  },
];

interface VehicleCategorySelectorProps {
  basePrice: number;
  onCategoryChange?: (category: VehicleCategory) => void;
}

const VehicleCategorySelector: React.FC<VehicleCategorySelectorProps> = ({
  basePrice,
  onCategoryChange,
}) => {
  const dispatch = useAppDispatch();
  const selectedCategory = useAppSelector((state) => state.trip.selectedCategory);

  const handleSelectCategory = (category: VehicleCategory) => {
    dispatch(setSelectedCategory(category));
    onCategoryChange?.(category);
  };

  const getCategoryColor = (category: VehicleCategory): string => {
    switch (category) {
      case 'economic':
        return colors.economic;
      case 'xl':
        return colors.xl;
      case 'premium':
        return colors.premium;
      default:
        return colors.primary;
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Elige tu viaje</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {vehicleOptions.map((vehicle) => {
          const isSelected = selectedCategory === vehicle.id;
          const estimatedPrice = Math.round(basePrice * vehicle.multiplier);

          return (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.vehicleCard,
                isSelected && styles.vehicleCardSelected,
                isSelected && { borderColor: getCategoryColor(vehicle.id) },
              ]}
              onPress={() => handleSelectCategory(vehicle.id)}
              activeOpacity={0.7}
            >
              <View style={styles.vehicleHeader}>
                <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
                {isSelected && (
                  <View
                    style={[
                      styles.selectedIndicator,
                      { backgroundColor: getCategoryColor(vehicle.id) },
                    ]}
                  >
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
              </View>

              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <Text style={styles.vehicleDescription}>{vehicle.description}</Text>

              <View style={styles.vehicleInfo}>
                <Text style={styles.vehiclePassengers}>👤 {vehicle.passengers}</Text>
              </View>

              <Text
                style={[
                  styles.vehiclePrice,
                  isSelected && { color: getCategoryColor(vehicle.id) },
                ]}
              >
                {formatPrice(estimatedPrice)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  vehicleCard: {
    width: 150,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  vehicleCardSelected: {
    backgroundColor: colors.backgroundSecondary,
    ...shadows.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  vehicleIcon: {
    fontSize: 32,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  vehicleName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  vehicleDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  vehicleInfo: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  vehiclePassengers: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  vehiclePrice: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default VehicleCategorySelector;
