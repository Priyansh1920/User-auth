import { IsString, IsNumber, IsNotEmpty } from "class-validator";

export class CourseDto {
    @IsString()
    name: string

    @IsString()
    description: string
    
    @IsString()
    level: string

    @IsNumber()
    @IsNotEmpty()
    price: number
}
