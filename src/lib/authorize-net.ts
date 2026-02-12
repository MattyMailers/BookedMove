import { decrypt } from './encryption';

interface ChargeParams {
  loginId: string;       // encrypted
  transactionKey: string; // encrypted
  opaqueDataDescriptor: string;
  opaqueDataValue: string;
  amount: number;
  bookingRef: string;
  customerEmail: string;
}

interface ChargeResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export async function chargePayment(params: ChargeParams): Promise<ChargeResult> {
  const apiLoginId = decrypt(params.loginId);
  const transKey = decrypt(params.transactionKey);

  const isSandbox = process.env.AUTHORIZE_NET_SANDBOX !== 'false';
  const endpoint = isSandbox
    ? 'https://apitest.authorize.net/xml/v1/request.api'
    : 'https://api.authorize.net/xml/v1/request.api';

  const payload = {
    createTransactionRequest: {
      merchantAuthentication: {
        name: apiLoginId,
        transactionKey: transKey,
      },
      transactionRequest: {
        transactionType: 'authCaptureTransaction',
        amount: params.amount.toFixed(2),
        payment: {
          opaqueData: {
            dataDescriptor: params.opaqueDataDescriptor,
            dataValue: params.opaqueDataValue,
          },
        },
        order: {
          invoiceNumber: params.bookingRef,
          description: `Booking ${params.bookingRef}`,
        },
        customer: {
          email: params.customerEmail,
        },
      },
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    const txResponse = data?.transactionResponse;
    if (txResponse?.responseCode === '1') {
      return { success: true, transactionId: txResponse.transId };
    }

    const errorMsg = txResponse?.errors?.[0]?.errorText
      || data?.messages?.message?.[0]?.text
      || 'Payment failed';
    return { success: false, error: errorMsg };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
