import * as path from 'path';
import * as fs from 'fs';
import { Post, getIndex, getRss, Meta, postsOfJournalItems, renderJournal } from './post';
import { promisify } from 'util';
import * as glob from 'glob';
import { struct_of_notes } from './sections';
import { getPosts } from './content';

const args = process.argv.slice(2);

if (args.length != 1) {
  console.error(`Usage: ${process.argv.slice(0, 2).join(" ")} $DIST_DIR`);
  process.exit(1);
}

const distDir = args[0];

// This script generates some html files for the blog

(async () => {

  const { metaposts, journalPosts, journalItems } = await getPosts();
  const posts = [...metaposts, ...journalPosts];
  posts.sort((a, b) => (a.date && b.date && b.date.localeCompare(a.date)) || b.dir.localeCompare(a.dir));

  fs.writeFileSync(path.join(distDir, 'index.html'), getIndex(posts), 'utf8');
  fs.mkdirSync(path.join(distDir, 'journal'), { recursive: true });
  fs.writeFileSync(path.join(distDir, 'journal/index.html'), renderJournal(journalItems), 'utf8');
  fs.writeFileSync(path.join(distDir, 'rss.xml'), getRss(posts), 'utf8');

  metaposts.forEach(post => {
    if (post.dir.match(/posts/)) {
      const indexPath = path.join(distDir, post.dir, 'index.html');
      if (!fs.existsSync(indexPath)) {
        throw new Error(`${indexPath} does not exist`);
      }
      const indexFile = fs.readFileSync(indexPath, 'utf8');
      let outFile = indexFile;
      outFile = outFile.replace(/(<head.*>)/, '$1\n<link rel="stylesheet" href="/style/default.css">');
      outFile = outFile.replace(/(<body.*>)/, `$1\n<div class="topbar"><a href="/">jcreed blog</a> &gt; ${post.title}</div>`);
      fs.writeFileSync(indexPath, outFile, 'utf8');
    }
  });


})();
