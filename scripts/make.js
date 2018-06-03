const fs = require('fs');

const posts = [
  {"dir": "2018-06-03", "title": "Focusing Dissection of Exponentials In Presheaf Categories"},
  {"dir": "2018-05-27", "title": "Depending on Category Variables, Dependently"},
  {"dir": "2018-05-20", "title": "Depending on Category Variables"},
  {"dir": "2018-05-13", "title": "Slices of Presheaf Categories"},
  {"dir":"2018-05-06", "title": "Everything I've Learned About Logic in the Last Decade or So, Part 4"},
  {"dir":"2018-04-29", "title": "Everything I've Learned About Logic in the Last Decade or So, Part 3"},
  {"dir":"2018-04-22", "title": "Everything I've Learned About Logic in the Last Decade or So, Part 2"},
  {"dir":"2018-04-15", "title": "Everything I've Learned About Logic in the Last Decade or So, Part 1"},
  {"dir":"2018-04-08", "title": "Wellen's Synthetic Differential Geometry"},
  {"dir":"2018-04-01", "title": "Doing $k$-means with intermediate points"},
];

let html = `<!DOCTYPE html>
<html>
	 <head>
	 <link rel="alternate" type="application/rss+xml" title="RSS 2.0" href="/rss.xml"/>
	 </head>
  <body>
	 <ul>
`;

posts.forEach(p => html += `    <li><a href="posts/${p.dir}/index.html">${p.title}</a>\n`);

html += `    </ul>
  </body>
</html>`;

fs.writeFileSync(__dirname + '/../index.html', html, 'utf8');

let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
	 <title>jcreedcmu.github.io</title>
	 <description>Occasional blogging about math</description>
	 <link>https://jcreedcmu.github.io/index.html</link>
	 <pubDate>${gmtDate(posts[0])}</pubDate>\n`;

function gmtDate(p) {
  return new Date(p.dir).toUTCString();
}

posts.forEach(p => {
  rss += `    <item>
      <title>${p.title}</title>
		<link>https://jcreedcmu.github.io/posts/${p.dir}/index.html</link>
      <pubDate>${gmtDate(p)}</pubDate>
    </item>\n`;
});

rss += '  </channel>\n</rss>\n';

fs.writeFileSync(__dirname + '/../rss.xml', rss, 'utf8');
