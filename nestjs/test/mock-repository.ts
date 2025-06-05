import { mock } from 'jest-mock-extended';
import { Repository } from 'typeorm';

export const createMockRepo = () => mock<Repository<any>>();
