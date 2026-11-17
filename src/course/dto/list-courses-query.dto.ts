import { Type } from 'class-transformer';
import { IsInt, IsIn, IsOptional, Max, Min, IsString } from 'class-validator';

export class ListCourseQuerySto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 20;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @IsString()
    @IsIn(['Beginner', 'Intermediate', 'Advanced'])
    level?: string;

    @IsOptional()
    @Type(() => Number)
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @Min(0)
    maxPrice?: number;
}