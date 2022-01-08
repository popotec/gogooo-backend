const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.MARIADB_HOST,
  port: process.env.MARIADB_PORT,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD,
  database: process.env.MARIADB_DATABASE,
  connectionLimit: 5,
});

// SELECT 기본 틀

async function exeSingleStat(sql, params) {
  let conn, result;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    result = await conn.query(sql, params);
    await conn.commit();
  } catch (err) {
    console.log(err);
    await conn.rollback();
    throw err;
  } finally {
    if (conn) conn.end();
    return result;
  }
}

async function startTransaction() {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('begin conn');
    console.log(conn);
    await conn.beginTransaction();
    conn.query(`USE ${config.database}`);
  } catch (err) {
    console.err(err);
    throw err;
  } finally {
    if (conn) conn.end();
    return conn;
  }
}

async function doStatement(conn, sql, params) {
  try {
    // console.log('here');
    // console.log(sql);
    console.log('do state conn');
    console.log(conn);
    let result = await conn.query(sql, params);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function commitTransaction(conn) {
  try {
    await conn.commit();
    if (conn) conn.end();
  } catch (err) {
    console.err(err);
    throw err;
  }
}

async function rollbackTransaction(conn) {
  try {
    await conn.rollback();
  } catch (err) {
    console.err(err);
    throw err;
  } finally {
    if (conn) conn.end();
  }
}

module.exports = {
  exeSingleStat,
  startTransaction,
  doStatement,
  commitTransaction,
  rollbackTransaction,
};
