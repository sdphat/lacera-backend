import { seeder } from 'nestjs-seeder';
import { UsersSeeder } from './user/users.seeder';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user/models/user.model';
import { UsersModule } from './user/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

seeder({
  imports: [
    UsersModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadModels: true,
        synchronize: true,
        models: [User],
      }),
      inject: [ConfigService],
    }),
    ,
  ],
}).run([UsersSeeder]);
