import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../course/schemas/course.schema.js';
import { PaymentService } from './payment.service.js';
import { CreatePurchaseDto } from './dto/create-purchase.dto.js';
import { Purchase, PurchaseDocument, PurchaseStatus } from './schemas/purchase.schema.js';

const DUPLICATE_KEY_CODE = 11000;

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    private readonly paymentService: PaymentService,
  ) {}

  async purchase(userId: string, dto: CreatePurchaseDto, idempotencyKey: string) {
    const course = await this.courseModel.findOne({ name: dto.courseName }).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // 1. Have we already seen this key from this user? Then replay, never charge again.
    const existing = await this.purchaseModel.findOne({ user: userId, idempotencyKey }).exec();
    if (existing) {
      return { purchase: this.replay(existing, String(course._id)), replayed: true };
    }

    // 2. Business rule: a course can only be bought once
    const alreadyOwned = await this.purchaseModel
      .findOne({ user: userId, course: course._id, status: PurchaseStatus.PAID })
      .exec();
    if (alreadyOwned) {
      throw new ConflictException('You have already purchased this course');
    }

    // 3. Record the attempt BEFORE charging. The unique index (user, key) makes this
    //    insert the "lock": if two identical requests race, only one insert wins.
    let purchase: PurchaseDocument;
    try {
      purchase = await this.purchaseModel.create({
        user: userId,
        course: course._id,
        amount: course.price,
        idempotencyKey,
      });
    } catch (err: unknown) {
      if ((err as { code?: number }).code === DUPLICATE_KEY_CODE) {
        const winner = await this.purchaseModel.findOne({ user: userId, idempotencyKey }).exec();
        if (winner) {
          return { purchase: this.replay(winner, String(course._id)), replayed: true };
        }
      }
      throw err;
    }

    // 4. Charge the money, then store the outcome
    const result = await this.paymentService.charge(
      purchase.amount,
      dto.paymentToken ?? 'tok_success',
    );
    purchase.status = result.success ? PurchaseStatus.PAID : PurchaseStatus.FAILED;
    purchase.paymentReference = result.reference;
    await purchase.save();

    return { purchase, replayed: false };
  }

  findMine(userId: string) {
    return this.purchaseModel.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }

  private replay(existing: PurchaseDocument, courseId: string) {
    // Same key but a different course = the client is reusing a key by mistake
    if (String(existing.course) !== courseId) {
      throw new ConflictException('Idempotency-Key was already used for a different request');
    }
    // The first request is still talking to the payment gateway
    if (existing.status === PurchaseStatus.PENDING) {
      throw new ConflictException('A request with this Idempotency-Key is still in progress');
    }
    return {existing,message:"You have already paid for this course"};
  }
}
