export type Post = {
  dir: string,
  date: string,
  title: string,
  description?: string,
}

function tocOfPost(post: Post): string {
  return `    <tr><td>${post.date}</td><td><a href="${post.dir}/">${post.title}</a></td></tr>`
}

export function getIndex(posts: Post[]): string {
  return `<!DOCTYPE html>
<html>
	 <head>
	 <link rel="alternate" type="application/rss+xml" title="RSS 2.0" href="/rss.xml"/>
    <link rel="stylesheet" href="style/default.css">
	 </head>
  <body>
	 <table>
${posts.map(tocOfPost).join('\n')}
    </table>
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
		<link>https://jcreedcmu.github.io/${post.dir}/</link>
      <description>${description}</description>
      <pubDate>${gmtDate(post)}</pubDate>
    </item>`;
}

export function getRss(posts: Post[]): string {
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
	 <title>jcreedcmu.github.io</title>
	 <description>Occasional blogging</description>
	 <link>https://jcreedcmu.github.io/index.html</link>
	 <pubDate>${gmtDate(posts[0])}</pubDate>
${posts.map(rssOfPost).join('\n')}
  </channel>
</rss>\n`;
}
