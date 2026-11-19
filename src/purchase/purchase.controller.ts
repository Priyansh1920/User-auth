import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthGaurd } from '../auth/auth.gaurd.js';
import { CreatePurchaseDto } from './dto/create-purchase.dto.js';
import { PurchaseService } from './purchase.service.js';
import { UserThrottlerGuard } from './user-throttler.guard.js';

type AuthRequest = Request & { user: { sub: string, email: string, } };

@Controller('purchases')
@UseGuards(AuthGaurd, UserThrottlerGuard) // order matters: auth first, so the throttler knows the user
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  // Rate limit: at most 5 purchase attempts per user per minute
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post()
  async create(
    @Req() req: AuthRequest,
    @Body() dto: CreatePurchaseDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!idempotencyKey || idempotencyKey.length > 255) {
      throw new BadRequestException('Idempotency-Key header is required (max 255 characters)');
    }

    const { purchase, replayed } = await this.purchaseService.purchase(
      req.user.sub,
      dto,
      idempotencyKey,
      req.user.email,
    );

    if (replayed) {
      // Not a new resource: tell the client this is the saved result of the first request
      res.status(200).setHeader('Idempotent-Replayed', 'true');
    }
    return purchase;
  }

  @Get('my')
  findMine(@Req() req: AuthRequest) {
    return this.purchaseService.findMine(req.user.sub);
  }
}
