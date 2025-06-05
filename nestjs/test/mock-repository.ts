import { mock } from 'jest-mock-extended';
import { Repository } from 'typeorm';

export const createMockRepo = <T = any>() => mock<Repository<T>>();
