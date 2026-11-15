import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { Course, CourseSchema } from '../course/schemas/course.schema.js';
import { PaymentService } from './payment.service.js';
import { PurchaseController } from './purchase.controller.js';
import { PurchaseService } from './purchase.service.js';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    // Default limit (per user, per minute); the purchase route sets a stricter one
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService, PaymentService],
})
export class PurchaseModule {}
