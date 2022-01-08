import * as express from 'express';

import * as resultCode from '../message/resultCode';
import * as passport from 'passport';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import * as mdbConnUser from '../models/user';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';
import * as redisClient from '../cmm/redis_connect';

import * as fcmAdmin from '../cmm/fcm_admin';

const postLogin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { pushToken } = req.body;
  passport.authenticate(
    'local',
    {
      session: false,
    },
    (authError, user, info) => {
      if (authError) {
        console.log(authError);
        return next(authError);
      }
      // user를 찾지 못한경우 user 값은 done으로 넘겨준 false 값이 셋팅됨
      // info에는 메세지가 셋팅됨
      if (!user) {
        const err = new Error('Error');
        res.status(resultCode.BADREQUEST);
        err.message = info;
        return next(err);
      }
      // req.login => passport.serializeUser 실행됨

      return req.login(
        user,
        {
          session: false,
        },
        loginError => {
          if (loginError) {
            //  loginError.message = '로그인중 오류가 발생하였습니다.';
            console.log(loginError);
            return next(loginError);
          }

          redisClient.hset(user['USER_ID'], 'pushToken', pushToken);
          if (!redisClient.print) {
            const err = new Error('Error');
            res.status(resultCode.BADREQUEST);
            err.message = '토큰 생성중 오류 발생';
          }

          redisClient.hget(user['USER_ID'], 'pushToken', function (err: Error, val: string) {
            console.log('pushToken');
            console.log(val);
            console.error(err);
          });
          const tokenJson = issuTokens(res, user['USER_ID'], 0);

          //TODO: LAST_LOGIN_DTTM update 해주기

          return res.status(resultCode.SUCCESS).json([
            {
              messsage: '로그인에 성공하였습니다.',
              accessToken: tokenJson['accessToken'],
              refreshToken: tokenJson['refreshToken'],
              user,
            },
          ]);
        }
      );
    }
  )(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
};

const postRefresh = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // refresh the damn token
  const { refreshToken } = req.body;

  const decodedToken = JSON.parse(refreshToken);

  console.log(decodedToken);
  //const refreshToken = headers[`refresjAuth`];

  //let verifiedJWT = jwt.verify(token, process.env.JWT_SECRET);
  const verifiedRefreshJWT: any = jwt.verify(decodedToken.token, process.env.JWT_REFRESH_SECRET ?? '');
  const userId = verifiedRefreshJWT.id as string;
  const isFind = redisClient.hget(userId, 'refreshToken', function (err: Error, val: string) {
    if (val !== decodedToken.token) {
      const err = new Error('Error');
      res.status(resultCode.BADREQUEST);
      err.message = '인증오류';
      return next(err);
    }

    //obj = JSON.parse(obj);
    const tokenJson = issuTokens(res, verifiedRefreshJWT.id, decodedToken.exp);

    console.log('tokenJson');
    console.log(tokenJson);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '토큰 갱신에 성공하였습니다.',
        accessToken: tokenJson['accessToken'],
        refreshToken: tokenJson['refreshToken'],
      },
    ]);
  });

  if (!isFind) {
    const err = new Error('Error');
    res.status(resultCode.BADREQUEST);
    err.message = '인증오류';
    return next(err);
  }
};

const doLogout = (req: express.Request, reres: express.Response, next: express.NextFunction) => {
  // redis.del(req.body.uid);

  req.logout();
  //req.session.destroy();
};

const checkDupEmail = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { email } = req.body;

    const rowsUser = await mdbConnUser.getUserInfoAllByEmail(email);

    let resDto: CheckDupResponseDto;
    // let message = '';
    if (rowsUser.length > 0) {
      // 이미 가입한 회원
      resDto = {
        isUnique: 'false',
        messsage: '이미 사용중인 이메일입니다',
      };
    } else {
      resDto = {
        isUnique: 'true',
        messsage: '사용 가능한 이메일입니다',
      };
    }

    return res.status(resultCode.SUCCESS).json(resDto);
  } catch (error) {
    return next(error);
  }
};

const checkDupName = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { name } = req.body;
    const rowsUser = await mdbConnUser.getUserInfoByName(name);

    let resDto: CheckDupResponseDto;
    if (rowsUser.length > 0) {
      resDto = {
        isUnique: 'false',
        messsage: '이미 사용중인 이름입니다.',
      };
    } else {
      resDto = {
        isUnique: 'true',
        messsage: '사용 가능한 이름입니다',
      };
    }

    return res.status(resultCode.SUCCESS).json(resDto);
  } catch (error) {
    return next(error);
  }
};

const apprAuthApplicant = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { email, token } = req.query;

  //let message = "";

  try {
    const rowsPreUser = await mdbConnUser.getJoinApplicant(email as string);
    if (rowsPreUser.length < 1) {
      const err = new Error();
      err.message = '유효하지 않은 요청입니다.';
      return next(err);
    }
    const preUser = rowsPreUser[0];
    //console.log(`seq : ${preUser["APPLY_SEQ"]}, TOKEN: ${preUser["KEY_TOKEN"]}`)
    if (preUser['TOKEN_KEY'] !== token) {
      const err = new Error();
      err.message = '인증토큰이 일치하지 않습니다.';
      return next(err);
    } else if (preUser['APPROVAL_DTTM'] !== null) {
      //이미 승인한 내역임
      res.render('sign-complete');
    }

    res.render('password-set', {
      title: '비밀번호 설정하기',
      email,
      token,
    });
  } catch (err) {
    return next(err);
  }
};

const applyJoin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { email } = req.body;

  // TO-DO : 적잘한 token 길이 찾기
  // 이메일에 링크로 심을 token 생성
  try {
    const key_one = crypto.randomBytes(256).toString('hex').substr(100, 10);
    const key_two = crypto.randomBytes(256).toString('base64').substr(50, 10);
    const token_key = key_one + key_two;

    // Amazno SES 서비스로 옮길경우 이부분 수정 필요
    const transporter = nodemailer.createTransport({
      // host: "smtp.gmail.com",
      //port: 587,
      service: 'gmail',
      //secure: false,
      auth: {
        //  type: "login",
        user: process.env.MAIL_ID, // gmail 계정 아이디를 입력
        pass: process.env.MAIL_PW, // gmail 계정의 비밀번호를 입력
      },
    });

    const rowsPreUser = await mdbConnUser.getJoinApplicant(email);

    let applySeq = 0;
    if (rowsPreUser.length > 0) {
      // 해당 이메일로 기존 신청내역이 있을 경우
      const preUser = rowsPreUser[0];
      applySeq = preUser['APPLY_SEQ']; // 마지막 신청번호
      // 기존 신청내역 삭제(ALT_TPCD=3)
      const updateResult = await mdbConnUser.deleteJoinApplicant(email, applySeq);
    }

    //preUser db table에 insert
    const result = await mdbConnUser.insertJoinApplicant(email, applySeq + 1, token_key);

    const headContent = getMailheadContent();
    const bodyContent = getMailBodyContent(email, token_key);
    const css = '';
    const mailOptions = {
      from: process.env.MAIL_ID,
      to: email,
      subject: '[Broadenway] 회원가입 이메일 인증 요청',
      //html: `<p>아래의 링크를 클릭해주세요 !</p><a href='${process.env.PROD_SVR_IP}/users/auth/auth-applicant/?email=${email}&token=${token_key}'>인증하기</a>`,
      html: `
            <!DOCTYPE html>
            <html lang="ko">
            ${headContent}
            ${bodyContent}
            </html>`,
      //getMailBodyContent(email, token_key) {
    };
    //메일 전송
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return next(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '가입 신청이 완료되었습니다.',
      },
    ]);
  } catch (error) {
    return next(error);
  }
};

const setPassword = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(req.body);
  // console.log(req);
  try {
    const { email, token, password, passwordConfirm } = req.body;

    let message;
    if (password !== passwordConfirm) {
      return res.status(resultCode.BADREQUEST).json([
        {
          messsage: '비밀번호가 일치하지 않습니다',
        },
      ]);
    }

    const rowsPreUser = await mdbConnUser.getJoinApplicant(email);
    if (rowsPreUser.length < 1) {
      return res.status(resultCode.BADREQUEST).json([
        {
          messsage: '유효하지 않은 요청입니다.',
        },
      ]);
    }
    const preUser = rowsPreUser[0];
    //console.log(`seq : ${preUser["APPLY_SEQ"]}, TOKEN: ${preUser["KEY_TOKEN"]}`)
    if (preUser['TOKEN_KEY'] !== token) {
      return res.status(resultCode.BADREQUEST).json([
        {
          messsage: '인증토큰이 일치하지 않습니다.',
        },
      ]);
    } else if (preUser['APPROVAL_DTTM'] !== null) {
      //이미 승인한 내역임

      return res.status(resultCode.BADREQUEST).json([
        {
          messsage: '이미 비밀번호를 설정하였습니다.',
        },
      ]);
    }

    // 승인 날짜를 현재 시간으로 update. 링크로 비밀번호 셋팅창 호출시 만료 알림
    const updateResult = await mdbConnUser.updateJoinApplicant(email, preUser['APPLY_SEQ']);

    //비밀번호 암호화
    const hash = await bcrypt.hash(password, 12);
    const result = await mdbConnUser.insertUser(email, hash);

    res.render('sign-complete');
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getPasswordSetPage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { email, token } = req.query;
    res.render('password-set', {
      title: '비밀번호 설정하기',
      email,
      token,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateUserPassword = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('updateUserPassword start');

  const bodyContents = req.body;

  // 1. 기존 비밀번호 확인

  let userPassword = ''; // DB에 입력된 사용자 비밀번호
  const rows = await mdbConnUser.getUserPassword(bodyContents['USER_ID']);
  const result = {};
  if (rows.length < 1) {
    const error = new Error();
    error.message = '현재 비밀번호를 다시 확인해주세요';
    res.status(resultCode.BADREQUEST);
    next(error);
  }

  const userData = rows[0];
  userPassword = userData['PASSWORD'];

  // 사용자가 입력한 현재 비밀번호
  //비밀번호 암호화
  const hashCurrentPassword = await bcrypt.hash(bodyContents['CURRENT_PASSWORD'], 12);

  // 비밀번호 동일한지 확인
  const resultCompare = await bcrypt.compare(bodyContents['CURRENT_PASSWORD'], userPassword);

  console.log(`resultCompare : ${resultCompare}`);

  // 2. 새로운 비밀번호 업데이트
  if (resultCompare) {
    const newPassword = bodyContents['NEW_PASSWORD'];
    const newPasswordRepeat = bodyContents['NEW_PASSWORD_REPEAT'];

    if (newPassword == newPasswordRepeat) {
      try {
        const hashNewPassword = await bcrypt.hash(newPassword, 12);

        const sucRes = await mdbConnUser.updateUserPassword(
          bodyContents['USER_ID'],
          hashNewPassword // 변경후비밀번호 암호화
        );

        return res.status(resultCode.SUCCESS).json([
          {
            message: '사용자 비밀번호 변경 성공',
            results: ['SUCCESS'],
          },
        ]);
      } catch (error) {
        console.log(error);
        return next(error);
      }
    } else {
      console.log('새로운 비밀번호 상호 불일치');

      return res.status(resultCode.SUCCESS).json([
        {
          message: '새로운 비밀번호가 서로 일치하지 않습니다.',
          results: [],
        },
      ]);
    }
  } else {
    console.log('현재 비밀번호가 정확하지 않습니다.');

    return res.status(resultCode.SUCCESS).json([
      {
        message: '현재 비밀번호가 정확하지 않습니다.',
        results: [],
      },
    ]);
  }
};

// const pushTest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
//   try {
//     const { token } = req.body;

//     sendFcm(token);
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };

// const pushTest2 = (req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.log(req.user);
//   const user = req.user;
//   try {
//     redisClient.hget(user['USER_ID'], 'pushToken', function (err: Error, val: string) {
//       console.log(val);
//       sendFcm(val);
//       console.error(err);
//     });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };

const testInsert = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { email, password } = req.body;

  console.log(`here1 : ${password}`);
  try {
    //let message = "";
    const hash = await bcrypt.hash(password, 12);
    console.log('here2');

    const result = await mdbConnUser.insertUser(email, hash);

    //USER 테이블에 데이터 이관 필요함
    console.log('here success');

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '인증에 성공하였습니다.',
      },
    ]);
  } catch (err) {
    return next(err);
  }
};

function issuTokens(res: express.Response, id: string, reExpTime: number) {
  const currentTime = Math.floor(Date.now() / 1000);
  const oneHour = 60 * 60; // 1시간

  const accessPayload = {
    id,
  };

  // access 토큰 생성
  const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET ?? '', {
    expiresIn: oneHour * 24,
  });

  const decoded = jwt.verify(accessToken, process.env.JWT_SECRET ?? '');
  console.log(`expiresIn`);
  console.log(currentTime + oneHour * 24);

  console.log(`expiresIn 2`);
  console.log(decoded);

  const accessJson = JSON.stringify({
    token: 'Bearer ' + accessToken,
    exp: currentTime + oneHour * 24,
  });

  let refreshJson = '';

  // 로그인시 refreshToken 처음 발급하는 경우이거나 갱신이 필요한 경우
  if (reExpTime - currentTime < oneHour) {
    const refreshPayload = {
      id,
    };
    // refresh 토큰 생성
    const refreshToken = jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET ?? '', {
      expiresIn: oneHour * 24 * 7,
    });

    refreshJson = JSON.stringify({
      token: refreshToken,
      // exp: currentTime + oneHour * 24 * 7,
    });

    redisClient.hset(refreshPayload.id, 'refreshToken', refreshToken);

    if (!redisClient.print) {
      const err = new Error('Error');
      res.status(resultCode.BADREQUEST);
      err.message = '토큰 생성중 오류 발생';
    }

    redisClient.hget(refreshPayload.id, 'refreshToken', function (err: Error, obj: string) {
      console.log(obj);
      console.log(err);
    });
  }
  // when reconverting, use JSON.parse

  const tokenJson = {
    accessToken: accessJson,
    refreshToken: refreshJson,
  };
  return tokenJson;
}

// function refresh_token(len: number) {
//   let text = '';
//   const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
//   for (let i = 0; i < len; i++) text += charset.charAt(Math.floor(Math.random() * charset.length));
//   return text;
// }

// function sendFcm(targetToken: string) {
//   //let targetToken = '';
//   const message = {
//     notification: {
//       title: 'test title',
//       body: 'this is a message to confirim transport success',
//     },
//     data: {
//       payload: 'this is payload',
//       stlye: 'gooood',
//     },
//     token: targetToken,
//   };

//   fcmAdmin
//     .messaging()
//     .send(message)
//     .then(function (response: Response) {
//       console.log(`success sending message: ${response}`);
//     })
//     .catch(function (error: Error) {
//       console.log(`fail sending message: ${error}`);
//     });
// }

export {
  postLogin,
  postRefresh,
  doLogout,
  checkDupEmail,
  apprAuthApplicant,
  applyJoin,
  setPassword,
  getPasswordSetPage,
  updateUserPassword,
  // pushTest,
  //pushTest2,
  testInsert,
  checkDupName,
};

interface CheckDupResponseDto {
  isUnique: string;
  messsage: string;
}

function getMailheadContent() {
  const headContent = `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>브로든 이메일 인증하기</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;500;700;900&display=swap" rel="stylesheet">

</head>`;
  return headContent;
}

function getMailBodyContent(email: string, token_key: string) {
  const bodyContent = `<body>
    <div style=" width: 500px;
    margin: 0 auto;
    padding: 60px 10px;">
        <div style="
    position: relative;
    width: 100%;
    /* 20201212 JIN. 필요없는 css
    height: 320px; */
    margin: 0 auto;
    /* 20201212 JIN. 필요없는 css
    background: url(../images/saybox.png) no-repeat 50% 0%; */
    padding: 20px 0 0 0;">
            <h1 style=" font-size: 42px;
    font-weight: 100;
    text-align: center;
    line-height: 1.1;">안녕하세요,<br><span style="font-weight: 700;">브로든</span>입니다.</h1>
            <p style="font-size: 16px;
    font-weight: 300;
    line-height: 1.4;
    text-align: center;
    margin-top: 20px;">회원가입을 위해 비밀번호 설정이 필요합니다.<br>아래의 링크를 클릭해주세요.</p>
            <div style="   display: block;
    width: 100%;
    margin: 0 auto;
    text-align: center;">
                <a style="width: 100%;
    height: 60px;
    background: #4545f1;
    font-size: 22px;
    font-weight: 500;
    color: #ffffff;
    display: inline-block;
    border-radius: 6px;
    text-align: center;
    line-height: 2.6;
    margin-top: 50px;" href='${process.env.SVR_IP}/user/auth/auth-applicant/?email=${email}&token=${token_key}' target="_blank" data-saferedirecturl="">인증하기</a>
            </div>
        </div>
    </div>
</body>`;
  return bodyContent;
}
