import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  title: string;
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  slug?: string;
  @IsInt()
  @IsPositive()
  stock: number;
  @IsString({ each: true })
  @IsArray()
  sizes: string[];
  @IsString()
  @IsIn(['men', 'woman', 'kid', 'unisex'])
  @IsOptional()
  gender?: string;
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];
  @IsString({ each: true })
  @IsArray()
  images: string[];
}
