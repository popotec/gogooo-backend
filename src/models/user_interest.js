const { exeSingleStat,
  doStatement
 } = require('./index.js');


async function deleteUserInterests(conn,userId) {
  var params = [userId];

  let result = await doStatement(conn,
    `DELETE
      FROM USER_INTEREST
      WHERE USER_ID =?
      `,
    params
  );
  return result;
}

async function insertUserInterest(conn,userId, interestId) {
    
  var params = [userId,interestId];
    let result = await doStatement(conn,
            `INSERT INTO USER_INTEREST (USER_ID,INTEREST_ID) VALUES(?,?)`,
            params
        );

  return result;
}


module.exports = {
  deleteUserInterests,
  insertUserInterest
};
