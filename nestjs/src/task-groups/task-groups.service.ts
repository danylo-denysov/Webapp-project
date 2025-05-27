import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskGroup } from './task-group.entity';
import { Board } from '../boards/board.entity';
import { CreateTaskGroupDto } from './dto/create-task-group.dto';
import { UpdateTaskGroupDto } from './dto/update-task-group.dto';

@Injectable()
export class TaskGroupsService {
  constructor(
    @InjectRepository(TaskGroup)
    private groupsRepository: Repository<TaskGroup>,

    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
  ) {}

  async get_task_groups(boardId: string): Promise<TaskGroup[]> {
    // TODO? ensure board exists
    const board = await this.boardsRepository.findOneBy({ id: boardId });
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    return this.groupsRepository.find({
      where: { board: { id: boardId } },
      order: { order: 'ASC', created_at: 'ASC' },
      relations: ['tasks'],
    });
  }

  async get_task_group_by_id(id: string): Promise<TaskGroup> {
    const found = await this.groupsRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });
    if (!found) {
      throw new NotFoundException(`TaskGroup with ID "${id}" not found`);
    }
    return found;
  }

  async create_task_group(
    boardId: string,
    dto: CreateTaskGroupDto,
  ): Promise<TaskGroup> {
    const board = await this.boardsRepository.findOneBy({ id: boardId });
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    // if no explicit order, append at end
    let order = dto.order;
    if (order == null) {
      const maxRaw = await this.groupsRepository
        .createQueryBuilder('g')
        .select('MAX(g.order)', 'max')
        .where('g.boardId = :boardId', { boardId })
        .getRawOne<{ max: number }>();
      order = (maxRaw?.max ?? -1) + 1;
    }

    const group = this.groupsRepository.create({
      name: dto.name,
      board,
      order,
    });
    return this.groupsRepository.save(group);
  }

  async update_task_group(
    boardId: string,
    groupId: string,
    dto: UpdateTaskGroupDto,
  ): Promise<TaskGroup> {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId, board: { id: boardId } },
    });
    if (!group) {
      throw new NotFoundException(`TaskGroup with ID "${groupId}" not found`);
    }

    if (dto.name != null) {
      group.name = dto.name;
    }
    if (dto.order != null) {
      group.order = dto.order;
    }

    return this.groupsRepository.save(group);
  }

  async delete_task_group(boardId: string, groupId: string): Promise<void> {
    const result = await this.groupsRepository.delete({
      id: groupId,
      board: { id: boardId },
    });
    if (result.affected === 0) {
      throw new NotFoundException(`TaskGroup with ID "${groupId}" not found`);
    }
  }
}
