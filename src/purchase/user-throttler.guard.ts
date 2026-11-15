import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

// By default the throttler counts requests per IP. Behind a shared office
// network that would punish everyone, so count per logged-in user instead.
// Must run after AuthGaurd, which sets req.user.
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.sub ?? req.ip;
  }
}
