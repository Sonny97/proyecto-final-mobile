/**
 * Stripe Payment Service
 * 
 * Note: Requires @stripe/stripe-react-native to be installed:
 * npm install @stripe/stripe-react-native
 * 
 * Also requires setup in iOS (Podfile) and Android (build.gradle)
 */

// Mock types when Stripe is not installed
interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

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

interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
}

// Stripe configuration
const STRIPE_CONFIG = {
  publishableKey: 'pk_test_your_publishable_key_here',
  merchantId: 'merchant.com.uberclone',
  merchantName: 'UberClone',
};

/**
 * Initialize Stripe SDK
 * Call this early in your app (e.g., in App.tsx)
 */
export const initializeStripe = async (): Promise<void> => {
  try {
    // When @stripe/stripe-react-native is installed:
    // await initStripe({
    //   publishableKey: STRIPE_CONFIG.publishableKey,
    //   merchantIdentifier: STRIPE_CONFIG.merchantId,
    // });
    console.log('Stripe initialized');
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    throw error;
  }
};

/**
 * Create a payment intent on your backend
 * This should call your server which creates the PaymentIntent with Stripe
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'cop',
  customerId?: string
): Promise<PaymentIntent> => {
  try {
    // In a real app, call your backend API
    // const response = await fetch('YOUR_BACKEND_URL/create-payment-intent', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount, currency, customerId }),
    // });
    // return await response.json();

    // Mock response for development
    return {
      id: `pi_${Date.now()}`,
      clientSecret: `pi_${Date.now()}_secret_mock`,
      amount,
      currency,
      status: 'requires_payment_method',
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Confirm payment with a payment method
 */
export const confirmPayment = async (
  clientSecret: string,
  paymentMethodId?: string
): Promise<PaymentResult> => {
  try {
    // When @stripe/stripe-react-native is installed:
    // const { paymentIntent, error } = await confirmPayment(clientSecret, {
    //   paymentMethodType: 'Card',
    //   paymentMethodData: paymentMethodId ? { paymentMethodId } : undefined,
    // });

    // Mock response for development
    return {
      success: true,
      paymentIntent: {
        id: `pi_${Date.now()}`,
        clientSecret,
        amount: 0,
        currency: 'cop',
        status: 'succeeded',
      },
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
};

/**
 * Present the Stripe payment sheet
 */
export const presentPaymentSheet = async (
  clientSecret: string
): Promise<PaymentResult> => {
  try {
    // When @stripe/stripe-react-native is installed:
    // await initPaymentSheet({
    //   paymentIntentClientSecret: clientSecret,
    //   merchantDisplayName: STRIPE_CONFIG.merchantName,
    // });
    // const { error } = await presentPaymentSheet();

    // Mock response for development
    return {
      success: true,
      paymentIntent: {
        id: `pi_${Date.now()}`,
        clientSecret,
        amount: 0,
        currency: 'cop',
        status: 'succeeded',
      },
    };
  } catch (error) {
    console.error('Error presenting payment sheet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment sheet failed',
    };
  }
};

/**
 * Get customer's saved payment methods
 */
export const getPaymentMethods = async (
  customerId: string
): Promise<PaymentMethod[]> => {
  try {
    // In a real app, call your backend API
    // const response = await fetch(`YOUR_BACKEND_URL/payment-methods/${customerId}`);
    // return await response.json();

    // Mock response for development
    return [
      {
        id: 'pm_mock_visa',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2027,
        },
      },
      {
        id: 'pm_mock_mastercard',
        type: 'card',
        card: {
          brand: 'mastercard',
          last4: '8888',
          expiryMonth: 6,
          expiryYear: 2026,
        },
      },
    ];
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return [];
  }
};

/**
 * Add a new payment method using Stripe's card collection UI
 */
export const addPaymentMethod = async (): Promise<PaymentMethod | null> => {
  try {
    // When @stripe/stripe-react-native is installed:
    // const { paymentMethod, error } = await createPaymentMethod({
    //   paymentMethodType: 'Card',
    // });

    // Mock response for development
    return {
      id: `pm_${Date.now()}`,
      type: 'card',
      card: {
        brand: 'visa',
        last4: '1234',
        expiryMonth: 12,
        expiryYear: 2028,
      },
    };
  } catch (error) {
    console.error('Error adding payment method:', error);
    return null;
  }
};

/**
 * Delete a saved payment method
 */
export const deletePaymentMethod = async (
  paymentMethodId: string
): Promise<boolean> => {
  try {
    // In a real app, call your backend API
    // await fetch(`YOUR_BACKEND_URL/payment-methods/${paymentMethodId}`, {
    //   method: 'DELETE',
    // });
    
    console.log('Payment method deleted:', paymentMethodId);
    return true;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return false;
  }
};

export default {
  initializeStripe,
  createPaymentIntent,
  confirmPayment,
  presentPaymentSheet,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
};
