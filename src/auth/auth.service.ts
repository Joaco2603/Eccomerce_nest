import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BcryptAdapter } from './adapter/bcrypt.adapter';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interface/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,

    private bcryptAdapter: BcryptAdapter,
  ) {
    this.bcryptAdapter = new BcryptAdapter();
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: this.bcryptAdapter.hashing(password, 15),
      });

      await this.userRepository.save(user);

      return {
        ...user,
        token: this.getJwtToken({ uuid: user.id }),
      };
    } catch (err) {
      this.handdleDBErrors(err);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email: email.toLocaleLowerCase() },
      select: { email: true, password: true, id: true },
    });

    if (!user) throw new UnauthorizedException('Credentials are not valid');

    if (!this.bcryptAdapter.compareHash(password, user.password))
      throw new UnauthorizedException('Credentials are not valid password');

    return {
      ...user,
      token: this.getJwtToken({ uuid: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handdleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
