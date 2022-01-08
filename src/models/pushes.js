/*
async function getLastMsgId(meetingId) {
    let conn, rows;
    try {
        conn = await pool.getConnection();
        conn.query(`USE ${config.database}`);
        console.log(`conn : ${conn}`);

        rows = await conn.query(
            `SELECT MAX(MESSAGE_ID) as LAST_MSG_ID FROM CHAT WHERE MEETING_ID=${meetingId};`
        );

        console.log(`rows : ${rows}`);
        //rows = await conn.query(`SELECT * FROM USERS`);
    } catch (err) {
        console.log(err);
        throw err;
    } finally {
        if (conn) conn.end();
        return rows;
    }
}
*/
async function insertPushChat(meetingId, messageId, receiverId, senderId, photoYn, payload, inputTime) {
    var params = [meetingId,messageId,receiverId,senderId,senderName,photoYn,payload,inputTime];
  let sql = `INSERT INTO CHAT(MEETING_ID,MESSAGE_ID,RECEIVER_ID,SENDER_ID,PHOTO_YN,PAYLOAD,INPUT_DTTM) VALUES(?,?,?,?,?,?,?,?)`;
  let result = await exeSingleStat(
    sql,
    params
  );
    return result;
}

module.exports = {
    insertPushChat,
   // getLastMsgId
};