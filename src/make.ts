import * as path from 'path';
import * as fs from 'fs';
import { Post, getIndex, getRss, Meta } from './post';
import { promisify } from 'util';
import * as glob from 'glob';


function postOfMeta(dir: string, meta: Meta): Post {
  return {
    dir, ...meta
  }
}

(async () => {

  const ignore = [
    'katex',
    'katex-0.12.0',
    'node_modules',
  ].map(x => `${x}/**`);

  const files = await promisify(glob.glob)('**/meta.json', { ignore });

  const posts = files.map(file => {
    return postOfMeta(path.dirname(file), JSON.parse(fs.readFileSync(file, 'utf8')) as Meta);
  });

  posts.sort((a, b) => (a.date && b.date && b.date.localeCompare(a.date)) || b.dir.localeCompare(a.dir));

  fs.writeFileSync(__dirname + '/../index.html', getIndex(posts), 'utf8');
  fs.writeFileSync(__dirname + '/../rss.xml', getRss(posts), 'utf8');

})();
