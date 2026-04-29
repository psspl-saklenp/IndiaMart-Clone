import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';

import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { LOCAL_UPLOAD_DIR, MAX_UPLOAD_BYTES } from './uploads.constants';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      // multer keeps the file in memory; UploadsService writes to disk.
      limits: { fileSize: MAX_UPLOAD_BYTES },
    }),
    // Static-serve the uploads dir at the server root: /uploads/<purpose>/<userId>/<file>.
    // Lives outside the /api/v1 prefix so plain <img> tags can hotlink without auth.
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), LOCAL_UPLOAD_DIR),
      serveRoot: '/uploads',
      serveStaticOptions: {
        cacheControl: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        index: false,
        fallthrough: false,
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
