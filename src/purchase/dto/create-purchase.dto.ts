import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePurchaseDto {
  @IsString()
  @IsNotEmpty()
  courseName: string;

  // Stand-in for a card token from the payment gateway
  @IsString()
  @IsOptional()
  paymentToken?: string;
}
