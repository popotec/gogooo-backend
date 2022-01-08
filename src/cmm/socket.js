const SocketIO = require('socket.io');

const mdbConnUser = require('../models/user');
const resultCode = require('../message/resultCode');
const jwt = require('jsonwebtoken');

//require('dotenv').config();

const { postNewChat, makeChat } = require('../controller/chatController');

module.exports = (server, app) => {
  const io = SocketIO(server, {
    path: '/socket.io',
  });

  app.set('io', io); // express 변수 저장 방법

  //namespace. 기본값 : io.of('/');
  const chat = io.of('/chat');

  chat
    .use(function (socket, next) {
      //  console.log(socket.handshake);
      let authToken = socket.handshake.headers.authorization;
      let meetingId = socket.handshake.headers.meetingid;

      if (authToken != null) {
        let tokenLen = authToken.length;
        let onlyToken = authToken.substring(7, tokenLen);
        //let decodedToken = jwt.verify(onlyToken, process.env.JWT_SECRET, function(err, decoded) {
        jwt.verify(onlyToken, process.env.JWT_SECRET, function (err, decodedToken) {
          if (err) return next(new Error('Authentication error'));
          socket.decoded_token = decodedToken;
          socket.meetingId = meetingId;
          next();
        });
      } else {
        next(new Error('Authentication error'));
      }
    })
    .on('connection', async socket => {
      console.log('connected to chat namespace ');

      const req = socket.request;
      //console.log('here socketID');
      //console.log(socket.id);
      const senderId = socket.decoded_token.id;

      // jwt토큰에서 꺼내온 id로 user 정보 가져옴
      let rowsUser = await mdbConnUser.getUserById(senderId);

      // user정보가 없는 id의 경우, 잘못된 접근입니다 메시지
      if (rowsUser.length < 1) {
        const error = new Error('Error');
        error.status = resultCode.BADREQUEST;
        error.message = '잘못된 접근입니다.';
        console.log(error);
        next(error);
      }
      const senderName = rowsUser[0]['NAME'];
      //console.log(rowsUser);

      let meetingId = socket.meetingId;

      socket.join(meetingId); // enter to room

      // TODO: 모임참가하기 버튼 누르고
      //makeChat(meetingId, 0, `${senderName}님이 입장하셨습니다`, chat);

      socket.on('disconnect', () => {
        console.log('chat namespace connection terminated');
        socket.leave(meetingId); // leave room

        //방에 인원이 하나도 없으면 방 제거 요청
        const currentRoom = socket.adapter.rooms[meetingId];

        //currentRoom.length : 현재 사용자수
        const userCount = currentRoom ? currentRoom.length : 0;
        if (userCount === 0) {
          /*        axios
                  .delete(`http://localhost:8005/room/${meetingId}`)
                  .then(() => {
                    console.log('removing room successed');
                  })
                  .catch((error) => {
                    console.error(error);
                  });*/
        } else {
          socket.to(meetingId).emit('exit', {
            user: 'system',
            chat: `2님이 퇴장하셨습니다.`,
            number: socket.adapter.rooms[meetingId].length,
          });
        }
      });

      /* TODO
     1. SOCKET-IO에서 하는 일이 너무 무거움. socket 으로 응답 후 로직들은 별도 js에서 처리하도록 분리.
     2. 테스트
     3. 시스템에서 메세지 보내는것 (~님이 참여하였습니다, ~님이 나가셨습니다, 날짜)
    */

      socket.on('error', function (error) {
        console.log(`error:${error}`);
      });
    });
};

//push_chat 테이블에 insert
