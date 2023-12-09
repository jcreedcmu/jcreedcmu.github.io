const fs = require('fs');
const path = require('path');
const readline = require('readline');

const asi = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '', terminal: true, history: [] })[Symbol.asyncIterator]();
async function getLine() {
  const result = (await asi.next());
  if (result.done) {
    throw new Error('EOF');
  }
  return result.value;
}

async function go() {
  console.log('Title:');
  const title = await getLine();
  const date = new Date().toISOString().substr(0,10);
  fs.mkdirSync(path.join(__dirname, `../posts/${date}`));
  const template = fs.readFileSync(path.join(__dirname, `../templates/post.html`), 'utf8');
  const post = template.replace(new RegExp('{- title -}', 'g'), title);
  const meta = {  date,  title };
  fs.writeFileSync(path.join(__dirname, `../posts/${date}/meta.json`), JSON.stringify(meta, null, 2), 'utf8');
  const postPath = path.join(__dirname, `../posts/${date}/index.html`);
  fs.writeFileSync(postPath, post, 'utf8');
  console.log(`wrote post to\n${postPath}`);
  process.exit(0);
}

go();
