const fs = require('fs');

const posts = [
  {"dir": "2021-01-14", "title": "Trees as Fibrations"},
  {"dir": "2020-12-20", "title": "Classical Logic in Intuitionistic Logic"},
  {"dir": "2020-11-22", "title": "Directed Spaces vs. Categories"},
  {"dir": "2020-01-05", "title": "Polynomials as $n$-cells"},
  {"dir": "2019-09-03", "title": "Some Thoughts on Story Games"},
  {"dir": "2018-08-31", "title": "Orienting Simplices"},
  {"dir": "2018-08-23", "title": "Some More Thoughts About Types with Internal References"},
  {"dir": "2018-08-19", "title": "Types of DAG-like structures"},
  {"dir": "2018-08-12", "title": "A Graph Polynomial, Sort of"},
  {"dir": "2018-08-05", "title": "A Simple Matrix Game"},
  {"dir": "2018-07-29", "title": "Focusing and Ends"},
  {"dir": "2018-07-22", "title": "Two Warping Operations"},
  {"dir": "2018-07-15", "title": "Action/Proposition Logic"},
  {"dir": "2018-07-08", "title": "Towards a Judgmental Reconstruction of Dynamic Logic"},
  {"dir": "2018-07-01", "title": "Focusing and Category Variables"},
  {"dir": "2018-06-24", "title": "Cache Types"},
  {"dir": "2018-06-17", "title": "Feeling the Yoneda Lemma in my Guts"},
  {"dir": "2018-06-10", "title": "Creative Annealing"},
  {"dir": "2018-06-03", "title": "Focusing Dissection of Exponentials In Presheaf Categories"},
  {"dir": "2018-05-27", "title": "Depending on Category Variables, Dependently"},
  {"dir": "2018-05-20", "title": "Depending on Category Variables"},
  {"dir": "2018-05-13", "title": "Slices of Presheaf Categories"},
  {"dir": "2018-05-06", "title": "Everything I've Learned About Logic in the Last Decade or So, Part 4"},
  {"dir": "2018-04-29", "title": "Everything I've Learned About Logic in the Last Decade or So, Part 3"},
  {"dir": "2018-04-22", "title": "Everything I've Learned About Logic in the Last Decade or So, Part 2"},
  {"dir": "2018-04-15", "title": "Everything I've Learned About Logic in the Last Decade or So, Part 1"},
  {"dir": "2018-04-08", "title": "Wellen's Synthetic Differential Geometry"},
  {"dir": "2018-04-01", "title": "Doing $k$-means with intermediate points"},
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
