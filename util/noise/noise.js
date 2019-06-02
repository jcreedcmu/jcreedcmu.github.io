

const d = new AudioContext();

const BUF_SEC = 10;

const rate = 44100;
const len = BUF_SEC * rate;
const f = 880;
const AVG = 28;

let sQ = {
  v: 0.5, min: 0, max: 20, range: "Qrange", text: "Q",
}
let sf = {
  v: 300, min: 10, max: 1500, range: "frange", text: "f",
}
let sgain = {
  v: 0.5, min: 0, max: 1, range: "gainrange", text: "gain",
}
let sliders = [sQ, sf, sgain];

sliders.forEach(slider => {
  document.getElementById(slider.range).oninput = e => {
	 slider.v = e.target.value / 100 * (slider.max - slider.min);
	 renderOther();
  };
});

// push .v values into ui elements
function render() {
  sliders.forEach(slider => {
	 document.getElementById(slider.range).value = 100 * (slider.v - slider.min) / (slider.max - slider.min);
  });
  renderOther();
}

// call when some slider.v has been updated
function renderOther() {
  sliders.forEach(slider => {
	 document.getElementById(slider.text).innerText = slider.v;
	 if (slider.callback != undefined) {
		(slider.callback)(slider.v);
	 }
  });
}

function make() {
  const buf = d.createBuffer(1 /* = 1 channel */, len, rate);
  const raw = new Float32Array(len);
  const raw2 = new Float32Array(len);
  const dat = buf.getChannelData(0);

  for (let t = 0; t < len; t++) {
    dat[t] = 2 * (Math.random() - 0.5);
  }
  const src = d.createBufferSource();
  src.buffer = buf;

  const gain = d.createGain();
  gain.gain.value = sgain.v;
  sgain.callback = v => gain.gain.value = v;

  const low = d.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = sf.v;
  sf.callback = v => low.frequency.value = v;
  low.Q.value = sQ.v;
  sQ.callback = v => low.Q.value = v;

  src.connect(low);
  low.connect(gain);
  gain.connect(d.destination);
  return src;
}

let src = null;

function go() {
  if (src == null) {
	 src = make();
	 src.loop = true;
	 src.start();
  }
}

function stop() {
  if (src != null) {
	 src.stop();
	 src = null;
  }
}

function toggle() {
  if (src == null) go(); else stop();
}

window.onmousedown = toggle;

document.getElementById("controls").onmousedown = (e) => { e.stopPropagation(); }

window.onkeydown = (e) => {
  if (e.keyCode == 32) {
	 e.preventDefault();
	 e.stopPropagation();
	 toggle();
  }
};

render();
