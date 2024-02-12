const BOX_SIZE = 25;
const gold = '#efb713';
const lightRed = '#ef8e8e';
const lightBlue = '#94bbf3'
const gray = '#cfcfcf';

function enhanceDim(dim) {
  return { min: dim.min, max: dim.max, size: {x:dim.max.x-dim.min.x, y:dim.max.y-dim.min.y}};
}

function rawDimOfItem(item) {
  switch (item.t) {
  case 'union': {
    const {items} = item;
    return dimOfItems(items);
  }
  case 'unionCenter': {
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
  case 'vgroup': {
    const {items, spacing} = item;
    const dims = items.map(dimOfItem);
    let maxdim = dims[0].max;
    dims.slice(1).forEach(dim => {
      maxdim.y += spacing + dim.max.y - dim.min.y;
    });
    return {min: dims[0].min, max: maxdim};
  }
  case 'box': {
    const {p, size} = item;
    return {min: p, max: {x: p.x + size.x, y: p.y+size.y}};
  }
  case 'text': {
    const {p, size} = item;
    return {min: p, max: {x: p.x + size.x, y: p.y+size.y}};
  }
  }
}

function dimOfItem(item) {
  return enhanceDim(rawDimOfItem(item));
}

function dimOfItems(items) {
  const dims = items.map(dimOfItem);
  return enhanceDim ({
    min: {x: Math.min(...dims.map(dim => dim.min.x)),
          y: Math.min(...dims.map(dim => dim.min.y))},
    max: {x: Math.max(...dims.map(dim => dim.max.x)),
          y: Math.max(...dims.map(dim => dim.max.y))},
  });
}

function renderItem(d, item, off) {
  switch (item.t) {
  case 'union': {
    item.items.forEach(item => {
      renderItem(d, item, off);
    });
  }
  case 'unionCenter': {
    const container = dimOfItem(item);
    item.items.forEach(item => {
      const dim = dimOfItem(item);
      renderItem(d, item, {x:off.x + (container.size.x - dim.size.x) / 2 ,
                           y:off.y + (container.size.y - dim.size.y) / 2});
    });
  }
  case 'hgroup': {
    let {x,y} = off;
    const {items, spacing} = item;
    const container = dimOfItem(item);
    items.forEach(item => {
      const dim = dimOfItem(item);
      renderItem(d, item,  {y:y + (container.size.y - dim.size.y) / 2 ,x});
      x += spacing + dim.size.x;
    });
  } break;
  case 'vgroup': {
    let {x,y} = off;
    const {items, spacing} = item;
    const container = dimOfItem(item);
    items.forEach(item => {
      const dim = dimOfItem(item);

      renderItem(d, item, {x:x + (container.size.x - dim.size.x) / 2 ,y});
      y += spacing + dim.size.y;
    });
  } break;
  case 'box': {
    const {p, size, color, text, textColor, fontSize} = item;
    d.lineWidth = 2;
    d.lineJoin = "round";
    d.fillStyle = color ?? "white";
    d.strokeStyle = "black";
    d.fillRect(p.x+off.x, p.y+off.y, size.x, size.y);
    d.strokeRect(p.x+off.x, p.y+off.y, size.x, size.y);

    if (text != undefined) {
      d.fillStyle = textColor ?? 'black';
      const fsize = fontSize ?? 15;
      d.font = `bold ${fsize}px sans-serif`;
      d.textAlign = "center";
      d.textBaseline = "middle";
      d.fillText(text, p.x + 0.5 * size.x + off.x, p.y + 0.5 * size.y + off.y);
    }
  } break;

  case 'text': {
    const {p, color, size, text, fontSize} = item;
    if (text != undefined) {
      d.fillStyle = color ?? 'black';
      const fsize = fontSize ?? 15;
      d.font = `bold ${fsize}px sans-serif`;
      d.textAlign = "center";
      d.textBaseline = "middle";
      d.fillText(text, p.x + 0.5 * size.x + off.x, p.y + 0.5 * size.y + off.y);
    }
  }
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





function equalPoints(p, q) {
  return p.x == q.x && p.y == q.y;
}


const ranks = 'A K Q J 10 9 8 7 6 5 4 3 2'.split(' ');
const minorRanks = 'K Q N P 10 9 8 7 6 5 4 3 2 A'.split(' ');
const majorRanks = ['XXI XX XIX XVIII XVII XVI XV XIV XIII XII XI'.split(' '), 'X IX VIII VII VI V IV III II I 0'.split(' ')];

const suits = '♣♦♥♠'.split('');

const tarotSuits = ['⍟','🍷','🪄','⸸'];

function colorOfSuit(suit) {
  switch (suit) {
  case '♦':
  case '♥':
    return 'red';
  case '♣':
  case '♠':
    return 'black';
  }
}

function textBox(rank) {
  return {t:'box', p:{x:0,y:0},size:{x:45,y:25},color:'white',text:rank, fontSize: 13};
}

function cardBox(rank, suit) {
  return {t:'box', p:{x:0,y:0},size:{x:38,y:25},color:'white',text:rank+suit,textColor:colorOfSuit(suit)};
}

function jokerBox(color) {
  return {t:'box', p:{x:0,y:0},size:{x:38,y:25},color:'white',text:'🃏⍟',textColor:color};
}

const standardDeck = {t: 'vgroup', spacing: 7, items: suits.map(suit =>
  ({t: 'hgroup', spacing: 7, items: ranks.map(rank => cardBox(rank, suit))})
)};

const standardDeckWithJokers = {t: 'vgroup', spacing: 7, items: [standardDeck, {
  t: 'hgroup', spacing: 7, items: [jokerBox('red'), jokerBox('black')],
}]};

const minorArcana = {t: 'vgroup', spacing: 7, items: tarotSuits.map(suit =>
  ({t: 'hgroup', spacing: 7, items: minorRanks.map(rank => cardBox(rank, suit))})
)};

const majorArcana = {t: 'vgroup', spacing: 7, items: [
  {t: 'hgroup', spacing: 7, items: majorRanks[0].map(rank => textBox(rank))},
  {t: 'hgroup', spacing: 7, items: majorRanks[1].map(rank => textBox(rank))},
]};

const tarotDeck = {t: 'vgroup', spacing: 7, items: [majorArcana, minorArcana]};

function functionDeckDots(reds, greens, blues) {
  if (reds == 0 && greens == 0 && blues == 0) {
    return {t: 'text', color: 'gray', text: '∅', size: {x:40,y:10}, p:{x:0,y:0}, fontSize:10};
  }
  function mkDots(n, color) {
    if (n == 0) return [];
    else if (n == 1) return [{t: 'text', color, text: '⬤', size: {x:40, y:10}, p:{x:0,y:0}, fontSize: 9}];
    else if (n == 2) return [{t: 'text', color, text: '⬤⬤', size: {x:40, y:10}, p:{x:0,y:0}, fontSize: 8}];
  }
  return {t: 'vgroup', spacing: 0, items: [
    ...mkDots(reds, 'red'),
    ...mkDots(greens, 'green'),
    ...mkDots(blues, 'blue'),
  ]};
}
function functionDeck3(reds, greens, blues) {return {t:'unionCenter', items: [
  functionDeckDots(reds, greens, blues),
  {t: 'box', p:{x:0,y:0}, size:{x:40,y:40}, color:'white'}
]};}
function functionDeck2(reds, greens) {return {t: 'hgroup', spacing: 7, items: [0,1,2].map(blues => functionDeck3(reds, greens, blues))};}
function functionDeck1(reds) {return {t: 'vgroup', spacing: 7, items: [0,1,2].map(greens => functionDeck2(reds, greens))};}
const functionDeck = {t: 'hgroup', spacing: 21, items: [0,1,2].map(reds => functionDeck1(reds))};

// "⬤"
const diagrams = [
  {name:'diagram1', k(d, wsize) {
    renderItems(d, [standardDeck], wsize);
  }},

  {name:'diagram2', k(d, wsize) {
    renderItems(d, [standardDeckWithJokers], wsize);
  }},

  {name:'diagram3', k(d, wsize) {
    renderItems(d, [tarotDeck], wsize);
  }},

  {name:'diagram4', k(d, wsize) {
    renderItems(d, [functionDeck], wsize);
  }},


];
