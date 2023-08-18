const BOX_SIZE = 25;
const gold = '#efb713';
const lightRed = '#ef8e8e';
const lightBlue = '#94bbf3'
const gray = '#cfcfcf';

function dimOfItem(item) {
  switch (item.t) {
  case 'union': {
    const {items} = item;
    return dimOfItems(items);
  }
  case 'hgroup': {
    const {items, spacing} = item;
    const dims = items.map(dimOfItem);
    let maxdim = dims[0].max;
    dims.slice(1).forEach(dim => {
      maxdim.x += spacing + dim.max.x - dim.min.x;
    });
    return {min: dims[0].min, max: maxdim};
  }
  case 'box': {
    const {x, y, size} = item;
    return {min: {x,y}, max: {x: x + size, y: y+size}};
  }
  case 'arc': {
    const {source, target} = item;
    return {min: {x:Math.min(source.x,target.x),y:Math.min(source.x,source.y)},
            max: {x:Math.max(source.x,target.x),y:Math.max(source.x,source.y)}};
  }

  }
}

function dimOfItems(items) {
  const dims = items.map(dimOfItem);
  return {
    min: {x: Math.min(...dims.map(dim => dim.min.x)),
          y: Math.min(...dims.map(dim => dim.min.y))},
    max: {x: Math.max(...dims.map(dim => dim.max.x)),
          y: Math.max(...dims.map(dim => dim.max.y))},
  }
}

function renderItem(d, item, off) {
  switch (item.t) {
  case 'union': {
    item.items.forEach(item => {
      renderItem(d, item, off);
    });
  }
  case 'hgroup': {
    let {x,y} = off;
    const {items, spacing} = item;
    items.forEach(item => {
      renderItem(d, item, {x,y});
      const dim = dimOfItem(item);
      x += spacing + dim.max.x - dim.min.x;
    });
  }
  case 'box': {
    const {x, y, size, color, text} = item;
    d.lineWidth = Math.floor(BOX_SIZE / 7);
    d.lineJoin = "round";
    d.fillStyle = color ?? "white";
    d.strokeStyle = "black";
    d.fillRect(x+off.x, y+off.y, size, size);

    d.strokeRect(x+off.x, y+off.y, size, size);

    if (text != undefined) {
      d.fillStyle = "black";
      d.font = "bold 15px sans-serif";
      d.textAlign = "center";
      d.textBaseline = "middle";
      d.fillText(text, x + 0.5 * BOX_SIZE + off.x, y + 0.5 * BOX_SIZE + off.y);
    }
  } break;

  case 'arc': {

    const ydiff = item.target.y - item.source.y;
    const xdiff = item.source.x - item.target.x;
    const norm = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
    const scale = Math.abs(xdiff) > Math.abs(ydiff) ? -25 : 25;
    const bend = norm / 50;
    const rot = {x: scale * ydiff / norm,
                 y: scale * xdiff / norm };
    const par = {x:  Math.abs(scale) * xdiff / norm,
                 y:  Math.abs(scale) * ydiff / norm};

    function arrowBody() {
      d.beginPath();
      d.moveTo(off.x + item.source.x + rot.x / 4, off.y + item.source.y + rot.y / 4 );
      d.bezierCurveTo(
        off.x + item.source.x + (1+bend) * rot.x, off.y + item.source.y + (1+bend) * rot.y,
        off.x + item.target.x + (1+bend) * rot.x, off.y + item.target.y + (1+bend) * rot.y,
        off.x + item.target.x + rot.x, off.y + item.target.y + rot.y
      );
    }

    function arrowHead() {
      d.beginPath();
      const ar = {x:0.15,y:0.4};
      d.moveTo(off.x + rot.x + item.target.x - par.x * ar.x, off.y + rot.y + item.target.y - par.y * ar.x);
      d.lineTo(off.x + rot.x + item.target.x + par.x * ar.x, off.y + rot.y + item.target.y + par.y * ar.x);
      d.lineTo(off.x + rot.x + item.target.x - rot.x * ar.y, off.y + rot.y + item.target.y - rot.y * ar.y);
      d.closePath();
    }

    arrowBody();
    d.lineWidth = 6;
    d.lineCap = "round";
    d.strokeStyle = "black";
    d.stroke();

    arrowHead();
    d.lineJoin = "miter";
    d.stroke();

    arrowBody();
    d.lineWidth = 3;
    d.lineCap = "round";
    d.strokeStyle = "gold";
    d.stroke();

    arrowHead();
    d.lineJoin = "miter";
    d.fillStyle = "gold";
    d.fill();
    d.stroke();


  } break;

  case 'group': {

  } break;
  }
}

function renderItems(d, items, wsize) {
  const dim = dimOfItems(items);
  const off = {x: (wsize.x - (dim.max.x - dim.min.x)) / 2,
               y: (wsize.y - (dim.max.y - dim.min.y)) / 2};
  items.forEach(item => { renderItem(d, item, off); });
}

function renderDiagram(diagram) {
  const {name, k} = diagram;
  const c = document.getElementById(name);
  const d = c.getContext('2d');
  const wsize = {x: c.offsetWidth, y: c.offsetWidth / 2};
  c.width = wsize.x;
  c.height = wsize.y;
  d.fillStyle = "#fbfbf4";
  d.fillRect(0,0,wsize.x,wsize.y);
  k(d, wsize);
}



function renderDiagrams() {
  diagrams.forEach(renderDiagram);
}

const exampleTab = [
  [43, 42, 37, 36, 28, 15, 13, 11, 10],
  [41, 38, 35, 29, 27, 14, 12,  9],
  [40, 34, 31, 26, 17,  8],
  [39, 33, 30, 25, 16,  7],
  [32, 24, 20, 19,  2],
  [23, 21, 18,  6],
  [22,  4,  3],
  [ 5],
  [ 1],
];

const exampleStartPos = {x:0, y:1};

const exampleStrictPointerTableau = [
  [-2, 2, 5, 1, 1, -1, -1, -1, 0],
  [-1, -2, -3, -4, 1, 2, 1,  0],
  [2, 4, 2, 2, 1,  -1],
  [-5, -3, 2, 2, 1,  0],
  [4, 3, 2, 1,  0],
  [3, 2, -1,  0],
  [2,  1,  0],
  [-1],
  [0],
];

const examplePointerTableau = [
  [-2, 2, 0, 0, 1, -1, -1, -1, 0],
  [0, -2, 0, 0, 1, 2, 1,  0],
  [2, 0, 2, 2, 1,  -1],
  [1, 0, 2, 2, 1,  0],
  [0, 3, 0, 0,  0],
  [-3, -1, 0,  0],
  [2,  1,  0],
  [0],
  [0],
];

const exampleCOptionalRecipe = [
  [-2, 2, 5, 1, 1, -1, -1, -1, 0],
  [1, -2, -3, 0, 1, 2, 1,  0],
  [2, 4, 2, 0, 1,  -1],
  [1, -3, 2, 0, 1,  0],
  [4, 3, 2, 0,  0],
  [0, -1, 0,  0],
  [2,  1,  0],
  [-1],
  [0],
]
const exampleCorner = {x: 3, y: 5};

function equalPoints(p, q) {
  return p.x == q.x && p.y == q.y;
}
function isCorner(tab, p) {
  return p.x == tab[p.y].length - 1
    && (p.y == tab.length-1 || tab[p.y+1].length != tab[p.y].length);

}

function boxMap(input, k) {
  return input.flatMap((row, j) => row.map((n, i) => {
    return k(i, j, {data: n, isCorner: isCorner(input, {x:i, y:j})});
  }));
}

function boxFlatMap(input, k) {
  return input.flatMap((row, j) => row.flatMap((n, i) => {
    return k(i, j, {data: n, isCorner: isCorner(input, {x:i, y:j})});
  }));
}

function getPath(tab, p) {
  let {x,y} = p;
  const rv = [];
  while (1)  {
    rv.push({x,y});
    let m = tab[y][x];
    if (m > 0) x += m;
    else if (m < 0) y -= m;
    else return rv;
  }
}

const diagrams = [
  {name:'diagram1', k(d, wsize) {

    const boxes = boxMap(exampleTab, (i, j, n) => (
      {t: 'box', x: i * BOX_SIZE, y: j * BOX_SIZE, size: BOX_SIZE}));

    renderItems(d, boxes, wsize);
  }},

  {name:'diagram2', k(d, wsize) {

    const boxes = boxMap(exampleTab, (i, j, b) => (
      {t: 'box', x: i * BOX_SIZE, y: j * BOX_SIZE, size: BOX_SIZE, text: b.data}));

    renderItems(d, boxes, wsize);
  }},

  {name:'diagram.corners', k(d, wsize) {


    const boxes = boxMap(exampleTab, (i, j, b) => (
      {t: 'box',
       x: i * BOX_SIZE,
       y: j * BOX_SIZE, size: BOX_SIZE,
       color: b.isCorner ? "#c0c0c0" : "white"}));

    renderItems(d, boxes, wsize);
  }},

  {name:'diagram.strict.pointer', k(d, wsize) {

    const boxes = boxMap(exampleStrictPointerTableau, (i, j, b) => (
      {t: 'box',
       x: i * BOX_SIZE,
       y: j * BOX_SIZE, size: BOX_SIZE,
       color: b.isCorner ? "#c0c0c0" : "white",
       text: b.data > 0 ?  `${b.data}\u2009\u25B8` // ▸
       : b.data < 0 ? `${-b.data}\u2009\u25be` // ▾
       : undefined}));

    renderItems(d, boxes, wsize);
  }},

  {name:'diagram.pointer', k(d, wsize) {

    const boxes = boxMap(examplePointerTableau, (i, j, b) => (
      {t: 'box',
       x: i * BOX_SIZE,
       y: j * BOX_SIZE, size: BOX_SIZE,
       color: b.isCorner ? "#c0c0c0" : "white",
       text: b.data > 0 ?  `${b.data}\u2009\u25B8` // ▸
       : b.data < 0 ? `${-b.data}\u2009\u25be` // ▾
       : undefined}));

    renderItems(d, boxes, wsize);
  }},

  {name:'diagram.c.optional.recipe', k(d, wsize) {

    const boxes = boxMap(exampleCOptionalRecipe, (i, j, b) => {
      const isExampleCorner = i == exampleCorner.x && j == exampleCorner.y;
      return {
        t: 'box',
        x: i * BOX_SIZE,
        y: j * BOX_SIZE, size: BOX_SIZE,
        color: isExampleCorner ? gold
          : b.isCorner ? "#c0c0c0" : "white",
        text: b.data > 0 ?  `${b.data}\u2009\u25B8` // ▸
          : b.data < 0 ? `${-b.data}\u2009\u25be` // ▾
          : undefined};
    });

    renderItems(d, boxes, wsize);
  }},

  {name:'diagram.hook', k(d, wsize) {

    const boxes = boxMap(exampleTab, (i, j, b) => {
      const [hx, hy] = [2, 1];
      const highlight = (i == hx && j >= hy) || (j == hy && i >= hx);
      return {t: 'box', x: i * BOX_SIZE, y: j * BOX_SIZE, size: BOX_SIZE, color: highlight ? gold : 'white'}
    });

    renderItems(d, boxes, wsize);
  }},

  {name:'diagram.lemma2.moves', k(d, wsize) {
    const path = getPath(exampleStrictPointerTableau, exampleStartPos);

    const boxes = boxMap(exampleStrictPointerTableau, (i, j, b) => (
      {t: 'box',
       x: i * BOX_SIZE,
       y: j * BOX_SIZE, size: BOX_SIZE,
       color: path.findIndex(item => item.x == i && item.y == j) != -1 ? gold:
       b.isCorner ? "#c0c0c0" : "white",
       text: b.data > 0 ?  `${b.data}\u2009\u25B8` // ▸
       : b.data < 0 ? `${-b.data}\u2009\u25be` // ▾
       : undefined}));

    renderItems(d, boxes, wsize);
  }},

  {name:'diagram.lemma2.erased', k(d, wsize) {

    const path = getPath(exampleStrictPointerTableau, exampleStartPos);
    const corner = path[path.length - 1];

    const boxes = boxMap(exampleStrictPointerTableau, (i, j, b) => {
      const inPath = path.findIndex(item => item.x == i && item.y == j) != -1;
      const dir = b.data > 0 ? '\u25B8' : '\u25be';
      const antidir = b.data < 0 ? '\u25B8' : '\u25be';
      const inRowOrCol = i == corner.x || j == corner.y;
      return {t: 'box',
              x: i * BOX_SIZE,
              y: j * BOX_SIZE, size: BOX_SIZE,
              color: inPath ? gold:
              b.isCorner ? "#c0c0c0" : "white",
              text: (inPath && inRowOrCol) ? undefined
              : inPath ? antidir
              : b.data > 0 ?  `${b.data}\u2009${dir}` // ▸
              : b.data < 0 ? `${-b.data}\u2009${dir}` // ▾
              : undefined}});

    renderItems(d, boxes, wsize);
  }},

  {name:'diagram.lemma2.selected', k(d, wsize) {
    const tab = exampleStrictPointerTableau;
    const path = getPath(tab, exampleStartPos);
    function inList(p, list) {
      return list.findIndex(item => item.x == p.x && item.y == p.y) != -1;
    }
    const corner = path[path.length - 1];
    function inRowOrCol(p) {
      return p.x == corner.x || p.y == corner.y;
    }
    const extraHighlights = path.flatMap(p => {
      const {x,y} = p;
      if (inRowOrCol(p))
        return [];
      if (tab[y][x] < 0) {
        return [{x:corner.x, y}];
      }
      else {
        return [{x, y:corner.y}];
      }
    });
    const boxes = boxMap(exampleStrictPointerTableau, (i, j, b) => {
      const p = {x:i,y:j};
      const inPath = inList(p, path);
      const dir = b.data > 0 ? '\u25B8' : '\u25be';
      const antidir = b.data < 0 ? '\u25B8' : '\u25be';
      return {t: 'box',
              x: i * BOX_SIZE,
              y: j * BOX_SIZE, size: BOX_SIZE,
              color: inList(p, extraHighlights) ? lightRed
              : inPath ? gold
              : b.isCorner ? "#c0c0c0" : "white",
              text: (inPath && inRowOrCol({x:i,y:j})) ? undefined
              : inPath ? antidir
              : b.data > 0 ?  `${b.data}\u2009${dir}` // ▸
              : b.data < 0 ? `${-b.data}\u2009${dir}` // ▾
              : undefined}});

    renderItems(d, boxes, wsize);
  }},

  {name:'diagram.lemma2.moved', k(d, wsize) {
    const tab = exampleStrictPointerTableau;
    const path = getPath(tab, exampleStartPos);
    function inList(p, list) {
      return list.findIndex(item => item.x == p.x && item.y == p.y) != -1;
    }
    const corner = path[path.length - 1];
    function inRowOrCol(p) {
      return p.x == corner.x || p.y == corner.y;
    }
    const newTab = tab.map(row => row.map(x => x)); // clone

    const thefts = path.flatMap(p => {
      const {x,y} = p;
      if (inRowOrCol(p)) {
        newTab[y][x] = 0;
        return [];
      }
      const source = (tab[y][x] < 0) ? {x:corner.x, y}: {x, y:corner.y};
      const sameDir = tab[source.y][source.x] * tab[y][x] < 0;
      const isX = newTab[source.y][source.x] > 0;
      return {
        target: {x,y},
        source,
        sameDir,
        isX,
        newValue: newTab[source.y][source.x] + (sameDir ? (isX ? source.x - x : y - source.y) : 0)
      };
    });

    thefts.forEach(t => {
      newTab[t.target.y][t.target.x] = t.newValue;
      newTab[t.source.y][t.source.x] = 0;
    });

    const boxes = boxMap(newTab, (i, j, b) => {
      const p = {x:i,y:j};
      const inPath = inList(p, path);
      const dir = b.data > 0 ? '\u25B8' : '\u25be';
      const antidir = b.data < 0 ? '\u25B8' : '\u25be';
      return {t: 'box',
              x: i * BOX_SIZE,
              y: j * BOX_SIZE, size: BOX_SIZE,
              color: (inPath && !inRowOrCol(p)) ? lightRed
              : b.isCorner ? "#c0c0c0" : "white",
              text: b.data > 0 ?  `${b.data}\u2009${dir}` // ▸
              : b.data < 0 ? `${-b.data}\u2009${dir}` // ▾
              : undefined
             }});

    const arcs = thefts.map(t => ({
      t: 'arc',
      source: {x: (0.5 + t.source.x) * BOX_SIZE, y: (0.5 + t.source.y) * BOX_SIZE},
      target: {x: (0.5 + t.target.x) * BOX_SIZE, y: (0.5 + t.target.y) * BOX_SIZE}}));

    renderItems(d, [...boxes, ...arcs], wsize);
  }},

  {name:'diagram.lemma2.final', k(d, wsize) {
    const tab = exampleStrictPointerTableau;
    const path = getPath(tab, exampleStartPos);
    function inList(p, list) {
      return list.findIndex(item => item.x == p.x && item.y == p.y) != -1;
    }
    const corner = path[path.length - 1];
    function inRowOrCol(p) {
      return p.x == corner.x || p.y == corner.y;
    }
    const newTab = tab.map(row => row.map(x => x)); // clone

    const thefts = path.flatMap(p => {
      const {x,y} = p;
      if (inRowOrCol(p)) {
        newTab[y][x] = 0;
        return [];
      }
      const source = (tab[y][x] < 0) ? {x:corner.x, y}: {x, y:corner.y};
      const sameDir = tab[source.y][source.x] * tab[y][x] < 0;
      const isX = newTab[source.y][source.x] > 0;
      return {
        target: {x,y},
        source,
        sameDir,
        isX,
        newValue: newTab[source.y][source.x] + (sameDir ? (isX ? source.x - x : y - source.y) : 0)
      };
    });

    thefts.forEach(t => {
      newTab[t.target.y][t.target.x] = t.newValue;
      newTab[t.source.y][t.source.x] = 0;
    });

    const boxes = boxMap(newTab, (i, j, b) => {
      const p = {x:i,y:j};
      const inPath = inList(p, path);
      const dir = b.data > 0 ? '\u25B8' : '\u25be';
      const antidir = b.data < 0 ? '\u25B8' : '\u25be';
      return {t: 'box',
              x: i * BOX_SIZE,
              y: j * BOX_SIZE, size: BOX_SIZE,
              color: i == corner.x && j == corner.y ? gold
              : b.isCorner ? "#c0c0c0" : "white",
              text: b.data > 0 ?  `${b.data}\u2009${dir}` // ▸
              : b.data < 0 ? `${-b.data}\u2009${dir}` // ▾
              : undefined
             }});


    renderItems(d, boxes, wsize);
  }},

  {name:'diagram.lemma1.before', k(d, wsize) {
    const tab1 = examplePointerTableau;
    const tab2 = exampleStrictPointerTableau;
    const corner = exampleCorner;
    function inRowOrCol(p) {
      return p.x == corner.x || p.y == corner.y;
    }

    const boxes1 = {t: 'union', items: boxMap(tab1, (i, j, b) => {
      const p = {x:i,y:j};
      const dir = b.data > 0 ? '\u25B8' : '\u25be';
      return {t: 'box',
              x: i * BOX_SIZE,
              y: j * BOX_SIZE, size: BOX_SIZE,
              color: equalPoints(p, corner)? gray : inRowOrCol(p) ? gold: 'white',
              text: b.data > 0 ?  `${b.data}\u2009${dir}` // ▸
              : b.data < 0 ? `${-b.data}\u2009${dir}` // ▾
              : undefined
             }})};

    const boxes2 = {t: 'union', items: boxMap(tab2, (i, j, b) => {
      const p = {x:i,y:j};
      const dir = b.data > 0 ? '\u25B8' : '\u25be';
      return {t: 'box',
              x: i * BOX_SIZE,
              y: j * BOX_SIZE, size: BOX_SIZE,
              color: equalPoints(p, corner)? gray : inRowOrCol(p) ? lightRed : 'white',
              text: b.data > 0 ?  `${b.data}\u2009${dir}` // ▸
              : b.data < 0 ? `${-b.data}\u2009${dir}` // ▾
              : undefined
             }})};


    renderItems(d, [{t: 'hgroup', items: [boxes1, boxes2], spacing: 30}], wsize);
  }},

  {name:'diagram.lemma1.after', k(d, wsize) {
    const tab1 = examplePointerTableau;
    const tab1a = tab1.map(row => row.map(x => x));
    const tab2 = exampleStrictPointerTableau;
    const tab2a = tab2.map(row => row.map(x => x));
    const corner = exampleCorner;

    function inRowOrCol(p) {
      return p.x == corner.x || p.y == corner.y;
    }

    for (let i = 0; i < corner.x; i++) {
      tab2a[corner.y][i] = tab1[corner.y][i];
      tab1a[corner.y][i] = tab2[corner.y][i];
    }

    for (let i = 0; i < corner.y; i++) {
      tab2a[i][corner.x] = tab1[i][corner.x];
      tab1a[i][corner.x] = tab2[i][corner.x];
    }

    // remove illegal moves
    tab1a.forEach((row, y) => row.forEach((cell, x) => {
      if (cell < 0 && equalPoints(corner, {x, y: y - cell}) ||
          cell > 0 && equalPoints(corner, {x: x + cell, y})) {
        tab1a[y][x] = 0;
      }
    }));

    const boxes1 = {t: 'union', items: boxFlatMap(tab1a, (i, j, b) => {
      const p = {x:i,y:j};
      if (equalPoints(p, corner)) return [];
      const dir = b.data > 0 ? '\u25B8' : '\u25be';
      return [{t: 'box',
              x: i * BOX_SIZE,
              y: j * BOX_SIZE, size: BOX_SIZE,
              color: inRowOrCol(p) ? lightRed : 'white',
              text: b.data > 0 ?  `${b.data}\u2009${dir}` // ▸
              : b.data < 0 ? `${-b.data}\u2009${dir}` // ▾
              : undefined
             }]})};

    const boxes2 = {t: 'union', items: boxMap(tab2a, (i, j, b) => {
      const p = {x:i,y:j};
      const dir = b.data > 0 ? '\u25B8' : '\u25be';
      return {t: 'box',
              x: i * BOX_SIZE,
              y: j * BOX_SIZE, size: BOX_SIZE,
              color: equalPoints(p, corner)? gray : inRowOrCol(p) ? gold : 'white',
              text: b.data > 0 ?  `${b.data}\u2009${dir}` // ▸
              : b.data < 0 ? `${-b.data}\u2009${dir}` // ▾
              : undefined
             }})};


    renderItems(d, [{t: 'hgroup', items: [boxes1, boxes2], spacing: 30}], wsize);
}},
];
