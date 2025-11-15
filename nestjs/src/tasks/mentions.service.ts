import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskMention } from './task-mention.entity';
import { User } from '../users/user.entity';
import { Task } from './task.entity';
import { TaskComment } from './task-comment.entity';

@Injectable()
export class MentionsService {
  constructor(
    @InjectRepository(TaskMention)
    private mentionsRepository: Repository<TaskMention>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Extract @mentions from text (e.g., "@john @jane" -> ["john", "jane"])
   */
  extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = text.matchAll(mentionRegex);
    const usernames = Array.from(matches, (m) => m[1]);
    return [...new Set(usernames)]; // Remove duplicates
  }

  /**
   * Process mentions in task description
   */
  async processMentionsInTask(
    taskId: string,
    content: string,
    mentionedByUserId: string,
    boardId: string,
  ): Promise<User[]> {
    const usernames = this.extractMentions(content);
    if (usernames.length === 0) return [];

    // Find users who are mentioned AND have access to this board
    const mentionedUsers = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('board_user', 'bu', 'bu.userId = user.id')
      .leftJoin('board', 'b', 'b.id = :boardId', { boardId })
      .where('user.username IN (:...usernames)', { usernames })
      .andWhere('(bu.boardId = :boardId OR b.ownerId = user.id)', { boardId })
      .getMany();

    // Delete old mentions for this task
    await this.mentionsRepository.delete({
      task: { id: taskId },
      mentionType: 'task_description',
    });

    // Create new mention records
    const mentions = mentionedUsers.map((user) =>
      this.mentionsRepository.create({
        mentionedUser: user,
        mentionedBy: { id: mentionedByUserId } as User,
        task: { id: taskId } as Task,
        comment: null,
        mentionType: 'task_description',
      }),
    );

    await this.mentionsRepository.save(mentions);
    return mentionedUsers;
  }

  /**
   * Process mentions in comment
   */
  async processMentionsInComment(
    commentId: string,
    content: string,
    mentionedByUserId: string,
    boardId: string,
  ): Promise<User[]> {
    const usernames = this.extractMentions(content);
    if (usernames.length === 0) return [];

    const mentionedUsers = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('board_user', 'bu', 'bu.userId = user.id')
      .leftJoin('board', 'b', 'b.id = :boardId', { boardId })
      .where('user.username IN (:...usernames)', { usernames })
      .andWhere('(bu.boardId = :boardId OR b.ownerId = user.id)', { boardId })
      .getMany();

    // Create mention records
    const mentions = mentionedUsers.map((user) =>
      this.mentionsRepository.create({
        mentionedUser: user,
        mentionedBy: { id: mentionedByUserId } as User,
        task: null,
        comment: { id: commentId } as TaskComment,
        mentionType: 'comment',
      }),
    );

    await this.mentionsRepository.save(mentions);
    return mentionedUsers;
  }

  /**
   * Get all mentions for a user
   */
  async getUserMentions(userId: string): Promise<TaskMention[]> {
    return this.mentionsRepository.find({
      where: { mentionedUser: { id: userId } },
      relations: ['task', 'comment', 'mentionedBy'],
      order: { created_at: 'DESC' },
    });
  }
}
