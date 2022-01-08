import * as express from 'express';
//import cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import * as path from 'path';
import * as passport from 'passport';
import * as dotenv from 'dotenv';
dotenv.config({
  path: path.resolve(process.cwd(), process.env.NODE_ENV == 'production' ? '.env' : '.env.dev'),
});

import userAuthRouter from './routes/users/auth';
import userProfileRouter from './routes/users/profile';
import userRouter from './routes/users';
import profilesRouter from './routes/profiles';
import interestsRouter from './routes/interests';
import meetingRouter from './routes/meetings';
import settingsRouter from './routes/settings';

import * as logger from './cmm/logger';
import * as passportConfig from './passport';
import * as resultCode from './message/resultCode';

import * as webSocket from './cmm/socket';

import { createConnection } from 'typeorm';
import connectionOptions from './ormConfig';

const app = express();

passportConfig(passport);

console.log(`dirname : ${__dirname}`);
const staticSourcePath = path.join(__dirname, '..');
console.log(`staticSourcePath : ${staticSourcePath}`);
app.set('view engine', 'pug');
app.set('views', path.join(staticSourcePath, 'views'));
app.set('port', process.env.PORT || 8001);

app.use(morgan('dev'));

app.use(express.static(path.join(staticSourcePath, 'public'))); // /main.css 접근가능 (public을 생략하고 접근가능)
app.use('/images', express.static(path.join(staticSourcePath, 'images'))); // /img/abc.png 접근가능. (실제 uploads 인 폴더 경로를 img로 대신 사용)

console.log(path.join(staticSourcePath, 'images'));

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(passport.initialize());

app.use('/users/auth', userAuthRouter);
app.use('/users/profile', userProfileRouter);
app.use('/users', userRouter);
app.use('/profiles', profilesRouter);
app.use('/interests', interestsRouter);
app.use('/meetings', meetingRouter);
//app.use('/meetings', meetingsRouter);

app.use('/settings', settingsRouter);
// app.use('/users/:userId/meetings', usersMeetingsRouter);

app.use((req, res: express.Response, next: express.NextFunction) => {
  const err: Error = new Error('Not Founds');
  res.status(resultCode.NOTFOUND);
  err.message = 'Not Found';
  next(err); // next에 파라미터를 넣게 되면 error로 간주되어 라우팅됨. https://expressjs.com/en/guide/using-middleware.html
});
app.use(errorLog);
app.use(errorHandler);
//파일에 에러 로그 남기기 구현

const server = app.listen(app.get('port'), () => {
  console.log(`${app.get('port')} server is started`);
});

createConnection(connectionOptions)
  .then(() => {
    console.log('mariadb ORM Connetion Success');
  })
  .catch(error => {
    console.log(error);
  });

webSocket(server, app);

function errorLog(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
  console.error(err.stack);
  next(err);
}
logger.info('this is info log');
//logger.error('this is error log');

function errorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
  if (res.headersSent) {
    return next(err);
  }
  if (err.message === null) {
    err.message = '오류가 발생하였습니다.';
  }
  res.json({
    message: err.message,
  });
}
