const resultCode = require('../message/resultCode');
const mdbConnInterests = require('../models/interests');

const getAllInterestList = async (req, res, next) => {
  const err = new Error('Error');
  err.status = resultCode.BADREQUEST;

  try {
    let rowsInterests = await mdbConnInterests.getAllInterestList();
    if (rowsInterests.length < 1) {
      err.message = '내역이 존재하지 않습니다.';
      return next(err);
    }

    console.log('Interests 조회 success');
    console.log(rowsInterests.json);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: rowsInterests,
      },
    ]);
  } catch (err) {
    return next(err);
  }
};
const getAllInterestIcons = async (req, res, next) => {
  const err = new Error('Error');
  err.status = resultCode.BADREQUEST;

  try {
    let rowsInterests = await mdbConnInterests.getAllInterestIcons();
    if (rowsInterests.length < 1) {
      err.message = '내역이 존재하지 않습니다.';
      return next(err);
    }

    console.log('Interests 조회 success');
    console.log(rowsInterests.json);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: rowsInterests,
      },
    ]);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllInterestList,
  getAllInterestIcons,
};
