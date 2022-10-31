import * as path from 'path';
import * as fs from 'fs';
import { Post, getIndex, getRss, Meta, postsOfJournalItems, renderJournal } from './post';
import { promisify } from 'util';
import * as glob from 'glob';
import { struct_of_notes } from './sections';


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

  const metaposts = files.map(file => {
    return postOfMeta(path.dirname(file), JSON.parse(fs.readFileSync(file, 'utf8')) as Meta);
  });

  const journalItems = struct_of_notes('JOURNAL', fs.readFileSync(path.join(__dirname, '../JOURNAL'), 'utf8'));
  journalItems.sort((a, b) => b.item.date.localeCompare(a.item.date));

  const journalPosts = postsOfJournalItems(journalItems);
  const posts = [...metaposts, ...journalPosts];



  fs.writeFileSync(path.join(__dirname, '../index.html'), getIndex(posts), 'utf8');
  fs.mkdirSync(path.join(__dirname, '../journal'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '../journal/index.html'), renderJournal(journalItems), 'utf8');
  fs.writeFileSync(path.join(__dirname, '../rss.xml'), getRss(posts), 'utf8');

})();
