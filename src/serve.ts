import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import { getContent, getPosts } from './content';
import { getIndex } from './post';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;


app.use('/', async (req, res, next) => {
  let m;
  console.log(req.path);
  const content = await getContent(req.path, true);
  if (content !== undefined) {
    res.status(200).contentType('text/html').send(content);
  }
  else {
    next();
  }
}, express.static(path.join(__dirname, "..")));
app.listen(port, () => {
  console.log(`Listening on ${port}...`);
});
