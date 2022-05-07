export type Post = Meta & {
  dir: string,
}

export type Meta = {
  date?: string,
  tag: string,
  title: string,
  description?: string,
  url?: string,
}

function urlOfPost(post: Post): string {
  return post.url ? post.url : `${post.dir}/`;
}

function tocOfPost(post: Post): string {
  return `    <tr><td>${post.date ?? ''}</td><td><a href="${urlOfPost(post)}">${post.title}</a></td></tr>`
}

export function getIndex(posts: Post[]): string {
  const untaggedPosts = posts.filter(p => p.tag === undefined);
  const taggedPosts = posts.filter(p => p.tag !== undefined);
  return `<!DOCTYPE html>
<html>
	 <head>
    <meta charset="UTF-8">
	 <link rel="alternate" type="application/rss+xml" title="RSS 2.0" href="/rss.xml"/>
    <link rel="stylesheet" href="style/default.css">
	 </head>
  <body>
  <div class="horiz">
    <div>
    <div class="header">POSTS</div>
  	   <table>
${untaggedPosts.map(tocOfPost).join('\n')}
      </table>
    </div>
    <div>
    <div class="header">OTHER</div>
    <table>
${taggedPosts.map(tocOfPost).join('\n')}
    </table>
    </div>
  </div>
  </body>
</html>`;
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
