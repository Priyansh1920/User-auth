import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // To show GET methods (Routes)
  getHello(): string {
    return this.appService.getHello();
  }
}
