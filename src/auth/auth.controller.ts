import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorators';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/rawHeaders.decorator';
import { Auth } from './decorators';
import { ValidRoles } from './interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Get('renovated')
  @UseGuards(AuthGuard())
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  //@Req() request: Express.Request
  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(@GetUser() user: User, @RawHeaders() header: any) {
    return { user: user, header };
  }

  // @SetMetadata('roles', ['admin', 'super-admin'])

  @Get('private2')
  @Auth(ValidRoles.admin)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
