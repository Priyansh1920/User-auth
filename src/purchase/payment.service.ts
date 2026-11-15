import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export type ChargeResult = { success: boolean; reference?: string };

// Fake payment gateway so we can learn the purchase flow without real money.
// Swap this class for Stripe/Razorpay later; the rest of the code stays the same.
@Injectable()
export class PaymentService {
  async charge(amount: number, paymentToken: string): Promise<ChargeResult> {
    // Simulate network latency of a real gateway
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Send paymentToken "tok_fail" to test a declined payment
    if (paymentToken === 'tok_fail') {
      return { success: false };
    }
    return { success: true, reference: `pay_${randomUUID()}` };
  }
}
