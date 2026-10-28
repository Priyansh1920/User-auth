import { Injectable } from '@nestjs/common';

@Injectable() 
//decorators - they add extra metadata
//to inject this service for others
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
