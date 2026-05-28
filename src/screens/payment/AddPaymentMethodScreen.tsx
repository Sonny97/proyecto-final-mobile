import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addPaymentMethod } from '../../services/payments/stripe';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

const AddPaymentMethodScreen = () => {
  const navigation = useNavigation();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatCardNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 16) {
      setCardNumber(formatCardNumber(cleaned));
    }
  };

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setExpiryDate(formatExpiryDate(cleaned));
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setCvv(cleaned);
    }
  };

  const isFormValid = (): boolean => {
    const cardClean = cardNumber.replace(/\s/g, '');
    const expiryClean = expiryDate.replace('/', '');
    return (
      cardClean.length >= 15 &&
      expiryClean.length === 4 &&
      cvv.length >= 3 &&
      cardholderName.trim().length > 0
    );
  };

  const handleAddCard = async () => {
    if (!isFormValid()) {
      Alert.alert('Error', 'Por favor completa todos los campos correctamente');
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, this would use Stripe's card collection
      const paymentMethod = await addPaymentMethod();

      if (paymentMethod) {
        Alert.alert('Éxito', 'Tarjeta agregada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', 'No se pudo agregar la tarjeta');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la tarjeta');
    } finally {
      setIsLoading(false);
    }
  };

  const getCardBrand = (): string => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'Amex';
    return '';
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agregar tarjeta</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card Preview */}
          <View style={styles.cardPreview}>
            <View style={styles.cardChip} />
            <Text style={styles.cardNumber}>
              {cardNumber || '•••• •••• •••• ••••'}
            </Text>
            <View style={styles.cardDetails}>
              <View>
                <Text style={styles.cardLabel}>Titular</Text>
                <Text style={styles.cardValue}>
                  {cardholderName.toUpperCase() || 'NOMBRE COMPLETO'}
                </Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>Expira</Text>
                <Text style={styles.cardValue}>{expiryDate || 'MM/AA'}</Text>
              </View>
            </View>
            {getCardBrand() && (
              <Text style={styles.cardBrand}>{getCardBrand()}</Text>
            )}
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número de tarjeta</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={colors.textLight}
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>Fecha de expiración</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/AA"
                  placeholderTextColor={colors.textLight}
                  value={expiryDate}
                  onChangeText={handleExpiryChange}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor={colors.textLight}
                  value={cvv}
                  onChangeText={handleCvvChange}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del titular</Text>
              <TextInput
                style={styles.input}
                placeholder="Como aparece en la tarjeta"
                placeholderTextColor={colors.textLight}
                value={cardholderName}
                onChangeText={setCardholderName}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              Tu información está protegida con encriptación de nivel bancario
            </Text>
          </View>
        </ScrollView>

        {/* Add Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.addButton, !isFormValid() && styles.addButtonDisabled]}
            onPress={handleAddCard}
            disabled={!isFormValid() || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>
              {isLoading ? 'Agregando...' : 'Agregar tarjeta'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  cardPreview: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    height: 200,
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: colors.warning,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  cardNumber: {
    ...typography.h2,
    color: colors.textWhite,
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    ...typography.caption,
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  cardValue: {
    ...typography.body,
    color: colors.textWhite,
    fontWeight: '500',
  },
  cardBrand: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    ...typography.body,
    color: colors.textWhite,
    fontWeight: '700',
  },
  form: {
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  securityText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  addButtonText: {
    ...typography.button,
    color: colors.textWhite,
  },
});

export default AddPaymentMethodScreen;
