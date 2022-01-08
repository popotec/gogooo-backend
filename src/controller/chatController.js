const resultCode = require('../message/resultCode');
const mdbConnChat = require('../models/chat');
const mdbConnUserMeeting = require('../models/user_meeting');

const redisClient = require('../cmm/redis_connect');

const {promisify} = require('util');
const getAsyncRedis = promisify(redisClient.hget).bind(redisClient);

const fcm = require('../cmm/fcm_admin');

//const fcmAdmin = require('../cmm/fcm_node');

const createNewChat = async (req, res, next) => {
    //console.log(req.body);
    const {
        meetingId
    } = req.params;

    const user = req.user;

    const {
        sid,
        chatMsg
    } = req.body;

    try {

        const io_chat = req.app.get('io').of('/chat');
        // chat namespace에 해당 room에 연결된 소켓의 id리스트
        makeChat(meetingId, user['USER_ID'], chatMsg, io_chat);

        return res.status(resultCode.SUCCESS).json([{
            messsage: '메세지 전송에 성공하였습니다.',
        }, ]);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

async function makeChat(meetingId, senderId, chatMsg, io_chat) {

    // 1.1 메세지 시간 설정
    // client는 해외일수도 있으니, 클라이언트 화면에서 보여줄 때 해당 국가 표준 시간으로 변환하여 보여주기
    let inputTime = Math.floor(Date.now() / 1000);
    console.log('inputTime: ' + inputTime);

    // 1.2 msgId 설정 : 마지막메세지 번호 찾아서 +1
    let row = await mdbConnChat.getLastMsgId(meetingId);
    if (row.length < 1) {
        return res.status(resultCode.BADREQUEST).json([{
            messsage: '유효하지 않은 요청입니다.',
        }, ]);
    }
    let msgId = row[0]['LAST_MSG_ID'] + 1;

    // 1.3 채팅 데이터 저장
    mdbConnChat.insertChat(meetingId, msgId, senderId, 0, chatMsg, inputTime);

    // 1.4 소켓을 이용해 메세지 보내기
    io_chat.to(meetingId).emit("textMsg", {
        //sid: socket.id,
        meetingId,
        msgId,
        senderId: senderId,
        chatMsg,
        photoYn: 0,
        inputTime, // 메세지 시간 표시
    });

    let room = await io_chat.adapter.rooms[meetingId];
    let conUserList = [];
    sockets = null;
    if (sockets != null) {
        var socketIdList = Object.keys(room.sockets);
        for (let i = 0; i < socketIdList.length; i++) {
            //socket의 id로 socket object 찾음
            var client_socket = io_chat.connected[socketIdList[i]]; //Do whatever you want with this

            //object의 id를 찾아서, 현재 연결되어있지 않은 참여원에게는 push로 알림
            conUserList.push(client_socket.decoded_token.id);
        }
    }

    let rows = await mdbConnUserMeeting.getUserMeetingList(senderId,meetingId);

    let userList = [];

    for (let i = 0; i < rows.length; i++) {

        const userId = rows[i]['USER_ID'];

        // js의 array는 map 자료구조
        const idx = conUserList.indexOf(userId);
        if (idx < 0) //못찾으면 -1 반환 
        {
            userList.push(userId);
        }
    }

    //2.2 PUSH noti 보내기

    let message = {
      /*  notification: {
            title: '브로든',
            body: '모임에서 새로운 이야기가 있습니다.',
       //     click_action: "FLUTTER_NOTIFICATION_CLICK",
        },*/
        android: {
            priority: "high",
           /* notification: {
                      icon: 'symbol',
                         color: '#7e55c3',
              //  clickAction: 'NOTI_CLICK',
                notificationCount: '1',
                channelId :'broadenwaychannel'
                },*/              
        },
        // Add APNS (Apple) config
        apns: {
            payload: {
                aps: {
                    alert: {
                      body: chatMsg 
                    },
                    sound:'default',
                    contentAvailable: true,
                },
            },
            headers: {
                "apns-push-type": "background",
                "apns-priority": "5", // Must be `5` when `contentAvailable` is set to true.
                "apns-topic": "io.flutter.plugins.firebase.messaging", // bundle identifier
            },
        },
        data: {
            type:'chat',
            meetingId: meetingId,
            msgId: `${msgId}`,
            senderId: `${senderId}`,
            chatMsg,
            photoYn: '0',
            inputTime: `${inputTime}`,
        }
        
    };

    let options = {
        priority: 'high',
        timeToLive:2419200,
        content_available:true,
    };

    console.log('meetingId');
    console.log(meetingId);
    let tokenList=[]
    for (let j = 0; j < userList.length; j++) {
        console.log('here inside');
        console.log(userList[j]);
        try {
            const userPushToken = await getAsyncRedis(userList[j],'pushToken');
            if (userPushToken != null && userPushToken != '') {
                console.log('here indise~ user');
                console.log(userList[j]);
                console.log(userPushToken);
                //tokenList.push(userPushToken);
                tokenList.push(userPushToken);
            }

        } catch (error) {
            console.log(error);
            next(error);
        }
    }
    console.log('here tokenlist');
    console.log(tokenList);
    
    //message.tokens = tokenList;
    fcm.sendNewFcm(message,tokenList);

};



const getChats = async (req, res, next) => {
    //console.log(req.body);
// lastReadId
    console.log('here unread data');
    const {
        meetingId
    } = req.params;

    const {
        lastReadId
    } = req.query;

    // "", null, undefined, 0, NaN 이면 false 반환
    if (!lastReadId) {
        lastReadId = 0;
    }
    try {
        let chats = await mdbConnChat.getChats(meetingId, lastReadId);

        /*if (chats.length < 1) {
            err.message = '모임에 참여자가 존재하지 않습니다.';
            return next(err);
        }*/
        console.log('미수신 채팅 메세지 조회');

        return res.status(resultCode.SUCCESS).json([{
            messsage: '조회에 성공하였습니다.',
            results: chats,
        }, ]);
    } catch (err) {
        return next(err);
    }
};


module.exports = {
    createNewChat,
    makeChat,
    getChats
};