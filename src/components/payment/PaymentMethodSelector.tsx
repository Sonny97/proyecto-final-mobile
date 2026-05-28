import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { getPaymentMethods, deletePaymentMethod } from '../../services/payments/stripe';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
}

interface PaymentMethodSelectorProps {
  selectedMethodId?: string;
  onSelect: (method: PaymentMethod) => void;
  onAddNew: () => void;
  customerId?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethodId,
  onSelect,
  onAddNew,
  customerId,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, [customerId]);

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const methods = await getPaymentMethods(customerId || 'default');
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (methodId: string) => {
    setDeletingId(methodId);
    try {
      const success = await deletePaymentMethod(methodId);
      if (success) {
        setPaymentMethods((prev) => prev.filter((m) => m.id !== methodId));
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const getCardIcon = (brand: string): string => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const getCardBrandName = (brand: string): string => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'amex':
        return 'American Express';
      default:
        return brand;
    }
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => {
    const isSelected = selectedMethodId === item.id;
    const isDeleting = deletingId === item.id;

    return (
      <TouchableOpacity
        style={[styles.methodCard, isSelected && styles.methodCardSelected]}
        onPress={() => onSelect(item)}
        activeOpacity={0.7}
        disabled={isDeleting}
      >
        <View style={styles.methodIconContainer}>
          <Text style={styles.methodIcon}>{getCardIcon(item.card?.brand || '')}</Text>
        </View>

        <View style={styles.methodInfo}>
          <Text style={styles.methodBrand}>
            {getCardBrandName(item.card?.brand || '')}
          </Text>
          <Text style={styles.methodLast4}>•••• {item.card?.last4}</Text>
          <Text style={styles.methodExpiry}>
            Expira {item.card?.expiryMonth}/{item.card?.expiryYear}
          </Text>
        </View>

        <View style={styles.methodActions}>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>✓</Text>
            </View>
          )}
          {!isSelected && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Text style={styles.deleteButtonText}>✕</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.loadingText}>Cargando métodos de pago...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Métodos de pago</Text>

      {paymentMethods.length > 0 ? (
        <FlatList
          data={paymentMethods}
          keyExtractor={(item) => item.id}
          renderItem={renderPaymentMethod}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={styles.emptyText}>No tienes métodos de pago guardados</Text>
        </View>
      )}

      <TouchableOpacity style={styles.addButton} onPress={onAddNew} activeOpacity={0.8}>
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>Agregar tarjeta</Text>
      </TouchableOpacity>

      {/* Cash option */}
      <TouchableOpacity
        style={[styles.methodCard, styles.cashOption]}
        onPress={() =>
          onSelect({ id: 'cash', type: 'cash' })
        }
        activeOpacity={0.7}
      >
        <View style={styles.methodIconContainer}>
          <Text style={styles.methodIcon}>💵</Text>
        </View>
        <View style={styles.methodInfo}>
          <Text style={styles.methodBrand}>Efectivo</Text>
          <Text style={styles.methodLast4}>Paga al conductor</Text>
        </View>
        {selectedMethodId === 'cash' && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  methodCardSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary + '10',
  },
  cashOption: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  methodIcon: {
    fontSize: 24,
  },
  methodInfo: {
    flex: 1,
  },
  methodBrand: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  methodLast4: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  methodExpiry: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2,
  },
  methodActions: {
    marginLeft: spacing.sm,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addButtonIcon: {
    fontSize: 20,
    color: colors.secondary,
    marginRight: spacing.sm,
    fontWeight: '700',
  },
  addButtonText: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: '600',
  },
});

export default PaymentMethodSelector;
