const headers = require('./headers');

function errorHandle(res, err) {
  let message = '';

  if (err) {
    message = err.message;
  } else {
    message = '欄位未填寫正確或查無此ID';
  }

  res.writeHead(400, headers);
  res.write(
    JSON.stringify({
      status: 'Error',
      message: message,
    })
  );
  res.end();
}

module.exports = errorHandle;
