import { Injectable } from '@nestjs/common';
import { SignupDto } from '../auth/dto/signup.dto';
import { User } from './entities/User.entity';
import { UserRepository } from './repository/user.repositroy';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ username });
  }

  async create(user: SignupDto): Promise<{ id: number }> {
    const { raw } = await this.userRepository.insert(user);
    return { id: raw.insertId };
  }

  async updateTokens(
    id: number,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    await this.userRepository.update({ id }, { refreshToken, accessToken });
  }

  async findByToken(id: number, accessToken: string): Promise<User> {
    return this.userRepository.findOne(
      { id, accessToken },
      { select: ['username', 'refreshToken'] },
    );
  }
}
