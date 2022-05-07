import * as fs from 'fs';
import { Post, getIndex, getRss } from './post';
import { promisify } from 'util';
import * as glob from 'glob';

type Meta = {
  date: string,
  title: string,
  description?: string,
}

function postOfMeta(meta: Meta): Post {
  return {
    dir: meta.date,
    title: meta.title,
    ...(meta.description && { description: meta.description }),
  }
}

(async () => {

  const files = await promisify(glob.glob)('**/meta.json');

  const posts = files.map(file => {
    return postOfMeta(JSON.parse(fs.readFileSync(file, 'utf8')) as Meta);
  });

  posts.sort((a, b) => b.dir.localeCompare(a.dir));

  fs.writeFileSync(__dirname + '/../index.html', getIndex(posts), 'utf8');
  fs.writeFileSync(__dirname + '/../rss.xml', getRss(posts), 'utf8');

})();
