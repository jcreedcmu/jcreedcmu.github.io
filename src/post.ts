export type Post = {
  dir: string,
  title: string,
  description?: string,
}

function tocOfPost(post: Post): string {
  return `    <li><a href="posts/${post.dir}/index.html">${post.title}</a>`
}

export function getIndex(posts: Post[]): string {
  return `<!DOCTYPE html>
<html>
	 <head>
	 <link rel="alternate" type="application/rss+xml" title="RSS 2.0" href="/rss.xml"/>
	 </head>
  <body>
	 <ul>
${posts.map(tocOfPost).join('\n')}
    </ul>
  </body>
</html>`;
}

function gmtDate(p: Post) {
  return new Date(p.dir).toUTCString();
}

function rssOfPost(post: Post): string {
  let description = '';
  if (post.description !== undefined) {
    description = `<![CDATA[ ${post.description} ]]>`;
  }
  return `    <item>
      <title>${post.title}</title>
		<link>https://jcreedcmu.github.io/posts/${post.dir}/index.html</link>
      <description>${description}</description>
      <pubDate>${gmtDate(post)}</pubDate>
    </item>`;
}

export function getRss(posts: Post[]): string {
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
	 <title>jcreedcmu.github.io</title>
	 <description>Occasional blogging about math</description>
	 <link>https://jcreedcmu.github.io/index.html</link>
	 <pubDate>${gmtDate(posts[0])}</pubDate>
${posts.map(rssOfPost).join('\n')}
  </channel>
</rss>\n`;
}
