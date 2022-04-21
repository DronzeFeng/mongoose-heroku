const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const headers = require('./headers');
const errorHandie = require('./errorHandl');
const successHandle = require('./successHandle');
const Room = require('./models/room');
dotenv.config({ path: './config.env' });
const dbPath = process.env.DB_PATH.replace(
  '<password>',
  process.env.DB_PASSWORD
);

mongoose
  .connect(dbPath)
  .then(() => {
    console.log('伺服器連線成功');
  })
  .catch((error) => {
    console.log(error);
  });

const requestListener = async (req, res) => {
  let body = '';
  req.on('data', (chunck) => {
    body += chunck;
  });

  if (req.url == '/rooms' && req.method == 'GET') {
    const rooms = await Room.find();
    successHandle(res, rooms);
  } else if (req.url == '/rooms' && req.method == 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (data.price) {
          const newRoom = await Room.create({
            name: data.name,
            price: data.price,
            rating: data.rating,
          });

          successHandle(res, newRoom);
        } else {
          errorHandie(res);
        }
      } catch (error) {
        errorHandie(res, error);
      }
    });
  } else if (req.url == '/rooms' && req.method == 'DELETE') {
    const rooms = await Room.deleteMany({});
    successHandle(res, rooms);
  } else if (req.url.startsWith('/rooms/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop();

    Room.findByIdAndDelete(id)
      .then(async () => {
        const rooms = await Room.find();
        successHandle(res, rooms);
      })
      .catch((error) => {
        errorHandie(res, error);
      });
  } else if (req.url.startsWith('/rooms/') && req.method === 'PATCH') {
    req.on('end', async () => {
      try {
        const id = req.url.split('/').pop();
        const data = JSON.parse(body);

        if (data !== undefined) {
          Room.findByIdAndUpdate(id, data)
            .then(async () => {
              const rooms = await Room.find();
              successHandle(res, rooms);
            })
            .catch((error) => {
              errorHandie(res, error);
            });
        } else {
          errorHandie(res);
        }
      } catch (error) {
        errorHandie(res, error);
      }
    });
  } else if (req.method === 'OPTIONS') {
    // preflight
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: 'Error',
        message: '404 Not Found',
      })
    );
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT);
