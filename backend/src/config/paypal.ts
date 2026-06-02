import paypal from '@paypal/checkout-server-sdk';

let client: paypal.core.PayPalHttpClient | null = null;

const getPayPalClient = (): paypal.core.PayPalHttpClient => {
  if (!client) {
    if (!process.env.PAYPAL_CLIENT_ID) {
      throw new Error('PAYPAL_CLIENT_ID not configured');
    }
    const environment = process.env.PAYPAL_ENVIRONMENT === 'live'
      ? new paypal.core.LiveEnvironment(
          process.env.PAYPAL_CLIENT_ID || '',
          process.env.PAYPAL_CLIENT_SECRET || ''
        )
      : new paypal.core.SandboxEnvironment(
          process.env.PAYPAL_CLIENT_ID || '',
          process.env.PAYPAL_CLIENT_SECRET || ''
        );
    client = new paypal.core.PayPalHttpClient(environment);
  }
  return client;
};

export const createPayPalOrder = async (amount: number, currency: string = 'USD') => {
  const paypalClient = getPayPalClient();
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toFixed(2),
      },
    }],
  });
  return paypalClient.execute(request);
};

export const capturePayPalOrder = async (orderId: string) => {
  const paypalClient = getPayPalClient();
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  return paypalClient.execute(request);
};

export default getPayPalClient;
