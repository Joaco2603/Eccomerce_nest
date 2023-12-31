import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { fileNamer, fileFilter } from 'src/common/helpers/';
import { ValidRoles } from 'src/auth/interface';
import { Auth } from 'src/auth/decorators';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/product/:imageName')
  findProductImage(
    @Param('imageName') imageName: string,
    @Res() res: Response,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Auth(ValidRoles.admin, ValidRoles.superUser)
  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits: { fileSize: 1000 },
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    if (!file) {
      throw new BadRequestException('Make sure that file is an Image');
    }

    const nameFile = file.path.split(`\\`)[2];

    const secureUrl = `${this.configService.get(
      'HOST_API',
    )}/product/${nameFile}`;

    return secureUrl;
  }
}
