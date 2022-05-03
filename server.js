const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const headers = require('./headers');
const errorHandle = require('./errorHandle');
const successHandle = require('./successHandle');
const Post = require('./models/post');
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

  if (req.url == '/posts' && req.method == 'GET') {
    const posts = await Post.find();

    successHandle(res, posts);
  } else if (req.url == '/posts' && req.method == 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (data !== undefined) {
          const newPost = await Post.create({
            content: data.content,
            image: data.image,
            createdAt: data.createdAt,
            name: data.name,
            likes: data.likes,
          });

          successHandle(res, newPost);
        } else {
          errorHandle(res);
        }
      } catch (error) {
        errorHandle(res, error);
      }
    });
  } else if (req.url == '/posts' && req.method == 'DELETE') {
    const posts = await Post.deleteMany({});

    successHandle(res, posts);
  } else if (req.url.startsWith('/posts/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop();

    Post.findByIdAndDelete(id)
      .then(async (data) => {
        const posts = await Post.find();

        if (data === null) {
          errorHandle(res);
        } else {
          successHandle(res, posts);
        }
      })
      .catch((error) => {
        errorHandle(res, error);
      });
  } else if (req.url.startsWith('/posts/') && req.method === 'PATCH') {
    req.on('end', async () => {
      try {
        const id = req.url.split('/').pop();
        const data = JSON.parse(body);

        if (data !== undefined && data.content !== '') {
          Post.findByIdAndUpdate(id, data, { new: true })
            .then(async (data) => {
              const posts = await Post.find();

              if (data === null) {
                errorHandle(res);
              } else {
                successHandle(res, posts);
              }
            })
            .catch((error) => {
              errorHandle(res, error);
            });
        } else {
          errorHandle(res);
        }
      } catch (error) {
        errorHandle(res, error);
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
server.listen(process.env.PORT || 3005);
