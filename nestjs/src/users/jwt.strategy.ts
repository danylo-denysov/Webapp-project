import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return (request?.cookies?.access_token as string | undefined) || null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback for backwards compatibility
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'), // getOrThrow will throw an error if the value is not found
    });
  }

  async validate(payload: any): Promise<Partial<User>> {
    const userId = payload.sub;
    const email = payload.email;
    const user = await this.usersRepository.findOne({
      where: { id: userId, email },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: user.id, email: user.email };
  }
}
