import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
type JwtPayload = { sub: string; email: string };
type AuthRequest = Request & { user?: JwtPayload };

@Injectable()
export class AuthGaurd implements CanActivate{
    constructor(private readonly jwtService: JwtService ){}

    async canActivate(context: ExecutionContext): Promise<boolean>  {
        const request = context.switchToHttp().getRequest<AuthRequest>();
        const token = this.extractToken(request);
        if (!token) {
            throw new UnauthorizedException();
        }

        try{
            request.user! = await this.jwtService.verifyAsync(token);
        }
        catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractToken(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}