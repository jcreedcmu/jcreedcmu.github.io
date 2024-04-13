import { Item, RichItem, struct_of_notes } from "./sections";

export type Post = Meta & {
  dir: string,
}

export type Meta = {
  date?: string,
  tags?: string[],
  title: string,
  description?: string,
  url?: string,
  category?: string,
}

function urlOfPost(post: Post): string {
  return post.url ? post.url : `${post.dir}/`;
}

function tocOfPost(post: Post): string {
  let classDecl = '';
  const makeTag = (x: string) => `tag-${x}`;
  if ((post.tags !== undefined)) {
    classDecl = ` class="${post.tags.map(makeTag).join(' ')}"`;
  }
  return `    <tr${classDecl}><td>${post.date ?? ''}</td><td><a href="${urlOfPost(post)}">${post.title}</a></td></tr>`
}

export function getIndex(posts: Post[]): string {
  const uncategorizedPosts = posts.filter(p => p.category === undefined);
  const otherPosts = posts.filter(p => p.category === 'other');

  otherPosts.unshift({
    dir: 'twelf-wasm',
    title: 'twelf-wasm', url: '/twelf-wasm',
    category: 'other', date: '2024-04-01', tags: ['twelf'], description: 'Twelf in WASM'
  });

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <link rel="alternate" type="application/rss+xml" title="RSS 2.0" href="/rss.xml"/>
    <link rel="stylesheet" href="style/default.css">
  </head>
  <body>
    <div class="topbar">jcreed blog</div>
    <div class="horiz">
      <div>
        <div class="header">POSTS</div>
        <table>
          ${uncategorizedPosts.map(tocOfPost).join('\n')}
        </table>
      </div>
      <div class="vert">
        <div>
          <div class="header">OTHER</div>
          <table>
            ${otherPosts.map(tocOfPost).join('\n')}
          </table>
        </div>
      </div>
    </div>
</body>
</html>
`;
}

function gmtDate(p: Post) {
  return new Date(p.date!).toUTCString();
}

function rssOfPost(post: Post): string {
  let description = '';
  if (post.description !== undefined) {
    description = `<![CDATA[ ${post.description} ]]>`;
  }
  return `    <item>
      <title>${post.title}</title>
		<link>https://jcreedcmu.github.io/${urlOfPost(post)}</link>
      <description>${description}</description>
      <pubDate>${gmtDate(post)}</pubDate>
    </item>`;
}

export function getRss(posts: Post[]): string {
  const datedPosts = posts.filter(p => p.date !== undefined);
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
	 <title>jcreedcmu.github.io</title>
	 <description>Occasional blogging</description>
	 <link>https://jcreedcmu.github.io/index.html</link>
	 <pubDate>${gmtDate(datedPosts[0])}</pubDate>
${datedPosts.map(rssOfPost).join('\n')}
  </channel>
</rss>\n`;
}

function entryIdOfRichItem(richItem: RichItem): string {
  return richItem.item.date.replace(/\./g, '_'); // Thought about using canonicalId
}

export function postsOfJournalItems(richItems: RichItem[]): Post[] {
  return richItems.map(richItem => {
    const { item } = richItem;
    const date = item.date.replace(/\./g, '-');
    const entryId = entryIdOfRichItem(richItem);
    const post: Post = {
      dir: 'journal', date: date,
      title: item.attrs.title ?? '[ untitled entry ]',
      category: 'journal',
      url: `journal/index.html#${entryId}`
    }
    return post;
  });
}

// takes in pseudo-markdown, outputs html
function renderBody(input: string): string {
  return input.replace(/\n\n/g, '<p>\n');
}

export function renderJournal(richItems: RichItem[]): string {
  const content = richItems.map(richItem => {
    const { item } = richItem;
    const entryId = entryIdOfRichItem(richItem);
    return `
<h2 id="${entryId}" class="journal-header"><a href="#${entryId}">${item.date}</a></h2>
<div class="journal-entry">
${renderBody(item.body)}
</div>
`;
  }).join('\n');
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="../style/default.css">
  </head>
  <body>
${content}
  </body>
</html>
`;
}
