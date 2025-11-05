import { Reflector } from '@nestjs/core';
import { IAllowAction } from './interface/permission.interface';

export const Permission = Reflector.createDecorator<IAllowAction>();
