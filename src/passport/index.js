const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
//require('dotenv').config();
const mdbConn = require('../models/user');
const bcrypt = require('bcrypt');

module.exports = (passport) => {
  // Local Strategy
  passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        // 저장되어있는 user를 비교
        try {
           console.log('here email');
           console.log(email);
          let rowsUser = await mdbConn.getUserInfoAllByEmail(email);


          console.log(rowsUser);
          if (rowsUser.length < 1) {
            done(null, false, {
              message: '입력한 이메일을 사용하는 계정을 찾을 수 없습니다. 이메일을 확인하고 다시 시도하세요.',
            });
          }
          //getUserById

          console.log('user info here');
         
          var user = rowsUser[0];
          console.log(user);

          const result = await bcrypt.compare(password, user['PASSWORD']);

          if (result) {
             // 사용자에게 넘겨줄 사용자 정보.
           // let resnUser = await mdbConn.getUserInfoAllByEmail(email);
            user['PASSWORD'] = '';
            done(null, user);
          } else {
            done(null, false, {
              message: '잘못된 비밀번호입니다. 다시 확인하세요.',
            });
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );

  //JWT Strategy
  passport.use(
    new JWTStrategy({
        //jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('Bearer'),
        //jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('jwt'),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          let rowsUser = await mdbConn.getUserById(jwtPayload['id']);
          if (rowsUser.length < 1) {
            const error = new Error('Error');
            error.status = resultCode.BADREQUEST;
            error.message = '없는 사용자 입니다.';
            console.log(error);
            done(null, false, error.message);
          }
          //세션에 저장할 정보
          var user = rowsUser[0];
          console.log('here success');
          done(null, user);
        } catch (error) {
          console.log(error);
          done(error);
        }
      }
    )
  );
};