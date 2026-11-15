import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum PurchaseStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export type PurchaseDocument = HydratedDocument<Purchase>;

@Schema({ timestamps: true })
export class Purchase {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  // Price at the time of purchase (the course price may change later)
  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, enum: PurchaseStatus, default: PurchaseStatus.PENDING })
  status: PurchaseStatus;

  // Sent by the client in the Idempotency-Key header
  @Prop({ required: true })
  idempotencyKey: string;

  // Reference id returned by the payment gateway
  @Prop()
  paymentReference?: string;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);

// The database itself guarantees one purchase per (user, key), even when two
// identical requests arrive at the same moment.
PurchaseSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true });
