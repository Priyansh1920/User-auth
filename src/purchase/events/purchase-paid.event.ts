export const PURCHASE_PAID = 'purchase.paid'

export type PurchasePaidEvent = {
    userId: string;
    tokenEmail: string;
    courseName: string;
    amount: number;
    paymentReference?: string;
}