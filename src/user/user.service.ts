import { Injectable } from '@nestjs/common';
import { SignupDto } from '../auth/dto/signup.dto';
import { User } from './entities/User.entity';
import { UserRepository } from './repository/user.repositroy';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ username });
  }

  async createUser(user: SignupDto): Promise<any> {
    const { raw } = await this.userRepository.insert(user);
    return { userId: raw.insertId };
  }
}
