import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const connectionOptions: ConnectionOptions = {
  type: 'mariadb',
  host: process.env.MARIADB_HOST,
  port: Number(process.env.MARIADB_PORT ?? '0'),
  username: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,
  synchronize: false,
  logging: true,
  entities: [__dirname + '/dist/entity/*.*'],
  //entities: ['/Users/PPoya/Jerry/gogooo/dist/entity/*.*'],
  //entities: ['./entity/*.*'],
  namingStrategy: new SnakeNamingStrategy(),
};

export default connectionOptions;
