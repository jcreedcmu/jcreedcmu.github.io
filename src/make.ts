import * as fs from 'fs';
import { Post, getIndex, getRss } from './post';

const posts: Post[] = [
  { "dir": "2021-12-28", "title": "Modal Logic for the Kolmogorov Puzzle" },
  { "dir": "2021-12-05", "title": "Chromatic Type Polynomials" },
  { "dir": "2021-09-26", "title": "Semisimplicial Types" },
  { "dir": "2021-09-20", "title": "Map Colorings in Type Theory" },
  {
    "dir": "2021-04-03", "title": "Sealevel Logic",
    "description": '<img src="https://jcreedcmu.github.io/posts/2021-04-03/map1.png">'
  },
  { "dir": "2021-03-14", "title": "Differential Geometry On Cartographic Spaces" },
  { "dir": "2021-02-04", "title": "Surface Diagrams" },
  { "dir": "2021-01-14", "title": "Trees as Fibrations" },
  { "dir": "2020-12-20", "title": "Classical Logic in Intuitionistic Logic" },
  { "dir": "2020-11-22", "title": "Directed Spaces vs. Categories" },
  { "dir": "2020-01-05", "title": "Polynomials as $n$-cells" },
  { "dir": "2019-09-03", "title": "Some Thoughts on Story Games" },
  { "dir": "2018-08-31", "title": "Orienting Simplices" },
  { "dir": "2018-08-23", "title": "Some More Thoughts About Types with Internal References" },
  { "dir": "2018-08-19", "title": "Types of DAG-like structures" },
  { "dir": "2018-08-12", "title": "A Graph Polynomial, Sort of" },
  { "dir": "2018-08-05", "title": "A Simple Matrix Game" },
  { "dir": "2018-07-29", "title": "Focusing and Ends" },
  { "dir": "2018-07-22", "title": "Two Warping Operations" },
  { "dir": "2018-07-15", "title": "Action/Proposition Logic" },
  { "dir": "2018-07-08", "title": "Towards a Judgmental Reconstruction of Dynamic Logic" },
  { "dir": "2018-07-01", "title": "Focusing and Category Variables" },
  { "dir": "2018-06-24", "title": "Cache Types" },
  { "dir": "2018-06-17", "title": "Feeling the Yoneda Lemma in my Guts" },
  { "dir": "2018-06-10", "title": "Creative Annealing" },
  { "dir": "2018-06-03", "title": "Focusing Dissection of Exponentials In Presheaf Categories" },
  { "dir": "2018-05-27", "title": "Depending on Category Variables, Dependently" },
  { "dir": "2018-05-20", "title": "Depending on Category Variables" },
  { "dir": "2018-05-13", "title": "Slices of Presheaf Categories" },
  { "dir": "2018-05-06", "title": "Everything I've Learned About Logic in the Last Decade or So, Part 4" },
  { "dir": "2018-04-29", "title": "Everything I've Learned About Logic in the Last Decade or So, Part 3" },
  { "dir": "2018-04-22", "title": "Everything I've Learned About Logic in the Last Decade or So, Part 2" },
  { "dir": "2018-04-15", "title": "Everything I've Learned About Logic in the Last Decade or So, Part 1" },
  { "dir": "2018-04-08", "title": "Wellen's Synthetic Differential Geometry" },
  { "dir": "2018-04-01", "title": "Doing $k$-means with intermediate points" },
];

fs.writeFileSync(__dirname + '/../index.html', getIndex(posts), 'utf8');
fs.writeFileSync(__dirname + '/../rss.xml', getRss(posts), 'utf8');
