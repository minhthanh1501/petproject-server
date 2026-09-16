import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto.js';

/**
 * PartialType comes from @nestjs/swagger, never @nestjs/mapped-types: only the
 * swagger version re-applies @ApiProperty metadata as well as class-validator
 * metadata. Mixing them produces a DTO that validates correctly but renders as
 * an empty object in Swagger - a silent failure. @nestjs/mapped-types has been
 * removed from package.json so the wrong import cannot be written by accident.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
