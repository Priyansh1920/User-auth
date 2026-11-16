import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../user/user.types.js";
import { ROLES_KEY } from "./roles.decorator.js";
import { UserService } from "../user/user.service.js";

@Injectable()
export class RolesGaurd implements CanActivate {
    constructor(private reflector: Reflector, private readonly userService: UserService){}

    async canActivate(context: ExecutionContext): Promise<boolean>  {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>
        (ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if(!requiredRoles){
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if(!user?.sub){
            return false;
        }

        const dbUser = await this.userService.findById(user.sub);
        return !!dbUser && requiredRoles.includes(dbUser.role as Role);
    }
}