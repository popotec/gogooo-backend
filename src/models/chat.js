const { exeSingleStat,
  doStatement} = require('./index.js');

async function getLastMsgId(meetingId) {

  var params = [meetingId];
  let sql = `SELECT COALESCE(MAX(MESSAGE_ID),0) as LAST_MSG_ID FROM CHAT WHERE MEETING_ID=?`;
  let result = await exeSingleStat(
    sql,
    params
  );
  return result;
}

//TODO : 메세지에 ' 있느경우 syntax 에러남. 해결필요
async function insertChat(
    meetingId,
    messageId,
    senderId,
    photoYn,
    payload,
    inputTime
) {

    var params = [meetingId, messageId, senderId, photoYn, payload, inputTime];
    let sql = `INSERT INTO CHAT(MEETING_ID,MESSAGE_ID,SENDER_ID,PHOTO_YN,PAYLOAD,INPUT_DTTM) VALUES(?,?,?,?,?,?)`;
    let result = await exeSingleStat(
        sql,
        params
    );
    return result;

}

async function getChats(meetingId, lastMsgId) {

    var params = [meetingId, lastMsgId];
    let sql = `SELECT 
            MEETING_ID
            ,MESSAGE_ID
            ,SENDER_ID
            ,PHOTO_YN
            ,PAYLOAD
            ,INPUT_DTTM
            FROM CHAT
            WHERE MEETING_ID=?
            AND MESSAGE_ID>?`;
    let result = await exeSingleStat(
        sql,
        params
    );
    return result;
}

module.exports = {
    insertChat,
    getLastMsgId,
  getChats,
};