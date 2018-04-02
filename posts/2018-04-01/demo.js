const c = document.getElementById('c');
const d = c.getContext('2d');
const r = Math.random;
c.width = 640;
c.height = 480;

const gm = {
  pts: [[50, 350], [500, 300], [ 200, 50]],
  lambdas: [[1,0,0],
            [0,1,0],
            [0,0,1],
            [0.5,0.5,0],
            [0.5,0,0.5],
            [0,0.5,0.5]],
  pt_colors: [[0,0,200], [0,200,0], [200,0,0]],
}


const pt_colors = math.multiply(gm.lambdas, gm.pt_colors).map(c => "rgba(" + c.join(",") + ",0.5)");
const pt_colors_solid = math.multiply(gm.lambdas, gm.pt_colors).map(c => "rgb(" + c.join(",") + ")");
const data = [];
gm.lambdas.forEach(lam => {
  const center = math.multiply(lam, gm.pts);
  for(let i = 0; i < 50; i++) {
    data.push([ center[0] + 80 * r(),  center[1] + 80 * r()]);
  }
});

const state = {};

function argmin(f, n) {
  let best = f(0);
  let bestn = 0;
  for (let i = 1; i < n; i++) {
    const v = f(i);
    if (v < best) {
      best = v;
      bestn = i;
    }
  }
  return bestn;
}

function sqdist(a, b) {
  return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]);
}

function assign() {
  const cur_points = math.multiply(gm.lambdas, state.centers);
  data.forEach((pt, i) => {
    state.assignment[i] = argmin(ix => {
      return sqdist(pt, cur_points[ix]);
    }, cur_points.length);
  });
}

function recenter() {
  const lambdas = gm.lambdas;
  const p = lambdas.map(() => []);
  data.forEach((pt, i) => {
    p[state.assignment[i]].push(i);
  });
  const M = lambdas[0].map((undefined, ibar) => {
    return lambdas[0].map((undefined, i) => {
      let rv = 0;
      lambdas.forEach((undefined, j) => {
        rv += lambdas[j][i] * lambdas[j][ibar] * p[j].length;
      });
      return rv;
    })});

  const Mi = math.inv(M);

  const ws = [0,1].map(coord => {
    const w = lambdas[0].map((undefined, ibar) => {
      let rv = 0;
      lambdas.forEach((undefined, j) => {
        p[j].forEach(ptix => {
          rv += lambdas[j][ibar] * data[ptix][coord]
        });
      });
      return rv;
    });
    return math.multiply(Mi, w);
  });

  state.centers = math.transpose(ws);
}

function render() {
  d.clearRect(0, 0, c.width, c.height);
  data.forEach((pt, i) => {
    d.fillStyle = pt_colors_solid[state.assignment[i]];
    d.beginPath();
    d.arc(pt[0], pt[1], 1.5, 0, 2 * Math.PI);
    d.fill();
  });

  gm.lambdas.forEach((lam, i) => {
    const c = math.multiply(lam, state.centers);
    d.fillStyle = pt_colors[i];
    d.beginPath();
    d.arc(c[0], c[1], i < 3 ? 10 : 5, 0, 2 * Math.PI);
    d.fill();
  });
}

function iterate() {
  assign();
  recenter();
  render();
}

function reset() {
  state.centers = [0,1,2].map(n => [r() * 500 + 100, r() * 300 + 100]);
  state.assignment = data.map(n => 0);
  render();
}

reset();
