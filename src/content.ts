import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { promisify } from 'util';
import { getIndex, Meta, Post, postsOfJournalItems } from './post';
import { RichItem, struct_of_notes } from './sections';

const postsDir = path.join(__dirname, '../posts');

function postOfMeta(dir: string, meta: Meta): Post {
  return {
    dir, ...meta
  }
}

const ignore = [
  'katex',
  'katex-0.12.0',
  'node_modules',
  'dist',
].map(x => `${x}/**`);

export async function getPosts(): Promise<{ metaposts: Post[], journalPosts: Post[], journalItems: RichItem[] }> {
  const files = await promisify(glob.glob)('**/meta.json', { ignore });

  const metaposts = files.map(file => {
    return postOfMeta(path.dirname(file), JSON.parse(fs.readFileSync(file, 'utf8')) as Meta);
  });

  const journalItems = struct_of_notes('JOURNAL', fs.readFileSync(path.join(__dirname, '../JOURNAL'), 'utf8'));
  journalItems.sort((a, b) => b.item.date.localeCompare(a.item.date));

  const journalPosts = postsOfJournalItems(journalItems);
  return { metaposts, journalPosts, journalItems }
}

export async function getContent(reqPath: string, dev?: boolean): Promise<string | undefined> {
  let m;
  if (reqPath == '/') {
    const { journalPosts, metaposts } = await getPosts();
    const posts = [...journalPosts, ...metaposts];
    posts.sort((a, b) => (a.date && b.date && b.date.localeCompare(a.date)) || b.dir.localeCompare(a.dir));
    return getIndex(posts);
  }
  else if (m = reqPath.match(new RegExp("/posts/([^/]*)/$"))) {
    const indexPath = path.join(postsDir, m[1], 'index.html');
    const postMeta = JSON.parse(fs.readFileSync(path.join(postsDir, m[1], 'meta.json'), 'utf8')) as Meta;
    const indexFile = fs.readFileSync(indexPath, 'utf8');
    let outFile = indexFile;
    outFile = outFile.replace(/(<head.*>)/, '$1\n<link rel="stylesheet" href="/style/default.css">');
    if (dev)
      outFile = outFile.replace(/(<head.*>)/, '$1\n<script src="/scripts/livereload.js"></script>');
    outFile = outFile.replace(/(<body.*>)/, `$1\n<div class="topbar"><a href="/">jcreed blog</a> &gt; ${postMeta.title}</div>`);
    return outFile;
  }
  else {
    return undefined;
  }
}
