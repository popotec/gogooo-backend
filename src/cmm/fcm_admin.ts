//let serviceAccount = require('../../path/to/fcmServiceAccountKey.json');
import * as serviceAccount from '../path/to/fcmServiceAccountKey.json';
import * as mdbConnPushes from '../models/pushes';
import * as fcmAdmin from 'firebase-admin';

if (fcmAdmin.apps.length === 0) {
  fcmAdmin.initializeApp({
    credential: fcmAdmin.credential.cert(serviceAccount as fcmAdmin.ServiceAccount),
    databaseURL: 'https://gogooo-bacbc.firebaseio.com',
  });
}
//sendNewFcm

function sendNewFcm(message: any, tokenList: any) {
  console.log('here fcm');

  /*
    message.token = tokenList[0];
    fcmAdmin.messaging().send(message)
        .then((response) => {
            console.log(response.successCount + ' messages were sent successfully');
        })
        .catch((error) => {
            console.log('error');
            console.log(error);  
        });*/
  console.log('tokenlist');
  console.log(tokenList);
  message.tokens = tokenList;
  fcmAdmin
    .messaging()
    .sendMulticast(message)
    .then(response => {
      console.log(response.successCount + ' messages were sent successfully');
    })
    .catch(error => {
      console.log('error');
      console.log(error);
    });
}

function sendFcm(targetToken: string, payload: fcmAdmin.messaging.MessagingPayload, options: any, targetId: string) {
  console.log('here fcm');

  fcmAdmin
    .messaging()
    .sendToDevice(targetToken, payload, options)
    .then(function (response) {
      console.log('Successfully sent message:', response);
    })
    .catch(function (error) {
      console.log('Error sending message:', error);
      const data: any = payload['data'];
      mdbConnPushes.insertPushChat(
        data['meetingId'],
        data['msgId'],
        targetId,
        data['senderId'],
        data['photoYn'],
        data['chatMsg'],
        data['inputTime']
      );
    });
}
//module.exports = fcmAdmin;

module.exports = {
  //  fcmAdmin,
  sendNewFcm,
  sendFcm,
};
