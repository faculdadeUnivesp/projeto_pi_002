import 'dotenv/config';
import { DataSource } from 'typeorm';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const databaseConfig = {
  type: 'mysql' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'uzze_user',
  password: process.env.DB_PASSWORD || 'uzze_password',
  database: process.env.DB_DATABASE || 'uzze',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
};

export default new DataSource(databaseConfig);
