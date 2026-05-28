import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { createPaymentIntent, confirmPayment } from '../../services/payments/stripe';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
  };
}

interface PaymentSheetProps {
  visible: boolean;
  amount: number;
  tripId: string;
  selectedPaymentMethod?: PaymentMethod;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

const PaymentSheet: React.FC<PaymentSheetProps> = ({
  visible,
  amount,
  tripId,
  selectedPaymentMethod,
  onSuccess,
  onCancel,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>(
    'idle'
  );

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      onError('Por favor selecciona un método de pago');
      return;
    }

    // Handle cash payment
    if (selectedPaymentMethod.id === 'cash') {
      setPaymentStatus('success');
      setTimeout(() => {
        onSuccess('cash_payment');
      }, 1500);
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Create payment intent
      const paymentIntent = await createPaymentIntent(amount, 'cop');

      // Confirm payment
      const result = await confirmPayment(
        paymentIntent.clientSecret,
        selectedPaymentMethod.id
      );

      if (result.success) {
        setPaymentStatus('success');
        setTimeout(() => {
          onSuccess(result.paymentIntent?.id || '');
        }, 1500);
      } else {
        setPaymentStatus('error');
        onError(result.error || 'Error al procesar el pago');
      }
    } catch (error) {
      setPaymentStatus('error');
      onError(error instanceof Error ? error.message : 'Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentMethodDisplay = (): string => {
    if (!selectedPaymentMethod) return 'Sin método seleccionado';
    if (selectedPaymentMethod.id === 'cash') return 'Efectivo';
    if (selectedPaymentMethod.card) {
      return `${selectedPaymentMethod.card.brand} •••• ${selectedPaymentMethod.card.last4}`;
    }
    return selectedPaymentMethod.type;
  };

  const renderContent = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color={colors.secondary} />
            <Text style={styles.statusTitle}>Procesando pago...</Text>
            <Text style={styles.statusSubtitle}>Por favor espera</Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.statusTitle}>¡Pago exitoso!</Text>
            <Text style={styles.statusSubtitle}>Gracias por tu viaje</Text>
          </View>
        );

      case 'error':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>✕</Text>
            </View>
            <Text style={styles.statusTitle}>Error en el pago</Text>
            <Text style={styles.statusSubtitle}>Intenta de nuevo</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setPaymentStatus('idle')}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <>
            {/* Trip Summary */}
            <View style={styles.tripSummary}>
              <Text style={styles.tripLabel}>Total del viaje</Text>
              <Text style={styles.tripAmount}>{formatPrice(amount)}</Text>
            </View>

            {/* Payment Method */}
            <View style={styles.paymentMethodContainer}>
              <Text style={styles.sectionLabel}>Método de pago</Text>
              <View style={styles.paymentMethodDisplay}>
                <Text style={styles.paymentMethodIcon}>
                  {selectedPaymentMethod?.id === 'cash' ? '💵' : '💳'}
                </Text>
                <Text style={styles.paymentMethodText}>{getPaymentMethodDisplay()}</Text>
              </View>
            </View>

            {/* Breakdown */}
            <View style={styles.breakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Tarifa base</Text>
                <Text style={styles.breakdownValue}>{formatPrice(amount * 0.7)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Distancia</Text>
                <Text style={styles.breakdownValue}>{formatPrice(amount * 0.2)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Tiempo</Text>
                <Text style={styles.breakdownValue}>{formatPrice(amount * 0.1)}</Text>
              </View>
              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(amount)}</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.payButton}
                onPress={handlePayment}
                disabled={!selectedPaymentMethod || isProcessing}
                activeOpacity={0.8}
              >
                <Text style={styles.payButtonText}>
                  {selectedPaymentMethod?.id === 'cash'
                    ? 'Confirmar pago en efectivo'
                    : `Pagar ${formatPrice(amount)}`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                disabled={isProcessing}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.dragHandle} />
          <Text style={styles.title}>Confirmar pago</Text>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
    maxHeight: '80%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statusContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  statusTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  statusSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconText: {
    fontSize: 40,
    color: colors.textWhite,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconText: {
    fontSize: 40,
    color: colors.textWhite,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
  tripSummary: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginHorizontal: spacing.md,
  },
  tripLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tripAmount: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  paymentMethodContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  paymentMethodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  paymentMethodText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  breakdown: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  breakdownLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  breakdownValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  totalLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actions: {
    padding: spacing.md,
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  payButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.error,
  },
});

export default PaymentSheet;
