

const d = new AudioContext();

const BUF_SEC = 10;

const rate = 44100;
const len = BUF_SEC * rate;
const f = 880;
const AVG = 28;
function make() {
  const buf = d.createBuffer(1 /* = 1 channel */, len, rate);
  const raw = new Float32Array(len);
  const raw2 = new Float32Array(len);
  const dat = buf.getChannelData(0);

  for (let t = 0; t < len; t++) {
    raw[t] = 0.25 * 2 * (Math.random() - 0.5);
	 dat[t] = 0;
  }

  for (let t = 0; t < len; t++) {
  	 for (let i = 0; i < AVG; i++) {
  		raw2[t] += raw[(t + i) % len] / AVG;
  	 }
  }

 for (let t = 0; t < len; t++) {
  	 for (let i = 0; i < AVG; i++) {
  		dat[t] += raw2[(t + i) % len] / AVG;
  	 }
  }

  const src = d.createBufferSource();
  src.buffer = buf;
  src.connect(d.destination);
  return src;
}

let src = null;

function go() {
  src = make();
  src.loop = true;
  src.start();
}

function stop() {
  if (src != null) {
	 src.stop();
	 src = null;
  }
}
