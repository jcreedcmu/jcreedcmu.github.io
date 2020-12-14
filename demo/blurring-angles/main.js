const TEX_W = 512;
const TEX_H = 512;

async function grabTextResource(path) {
  return (await fetch(path, {cache: "no-cache"})).text();
}

function shaderProgram(gl, vs, fs) {
  const prog = gl.createProgram();
  const addshader = (type, source) => {
	 const s = gl.createShader((type == 'vertex') ?
										gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
	 gl.shaderSource(s, source);
	 gl.compileShader(s);
	 if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
		throw "Could not compile "+type+
		  " shader:\n\n"+gl.getShaderInfoLog(s);
	 }
	 gl.attachShader(prog, s);
  };
  addshader('vertex', vs);
  addshader('fragment', fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
	 throw "Could not link the shader program!";
  }
  return prog;
}

function attributeSetFloats(gl, prog, attr_name, rsize, arr) {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr),
					 gl.STATIC_DRAW);
  const attr = gl.getAttribLocation(prog, attr_name);
  gl.enableVertexAttribArray(attr);
  gl.vertexAttribPointer(attr, rsize, gl.FLOAT, false, 0, 0);
}

// make a new texture and set some sensible defaults for it
function makeTex(gl, data) {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  const level = 0;
  const internalFormat = gl.RGBA;
  const border = 0;
  const format = gl.RGBA;
  const type = gl.UNSIGNED_BYTE;
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, TEX_W, TEX_H, border, format, type, data);
  return texture;
}

// Make a new framebuffer object bound to a texture. The texture it's
// bound to is the one it *outputs* to when we render.
function makeFb(gl, texture) {
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  return framebuffer;
}

// Return a record containing some useful global state.
// The arguments are the text of the vertex shader and the fragment shader.
function setupContext(vert, frag) {
  let gl;
  try {
	 gl = document.getElementById("webgl")
		  .getContext("webgl2");
	 if (!gl) { throw "x"; }
  } catch (err) {
	 throw "Your web browser does not support WebGL, or else something else went wrong.";
  }

  const prog = shaderProgram(gl, vert, frag);
  gl.useProgram(prog);

  const canvasSize = gl.getUniformLocation(prog, 'u_canvasSize');
  const sampler = gl.getUniformLocation(prog, 'u_texture');

  gl.uniform1i(sampler, 0);
  gl.uniform2f(canvasSize, TEX_W, TEX_H);

  const param1 = gl.getUniformLocation(prog, 'u_param1');
  gl.uniform1f(param1, 0.85);

  // Fill a TEX_W by TEX_H buffer of RGBA values with random noise in
  // the red and green channels.
  const data = []
  for (let i = 0; i < TEX_W * TEX_H; i++) {
	 data.push(Math.random() * 256, Math.random() * 256, 0, 255);
  }

  // Create a pair of textures and framebuffers that we can ping-pong
  // between when we iterate.
  const texs = [ makeTex(gl, null), makeTex(gl, new Uint8Array(data)) ];
  const fbs = [ makeFb(gl, texs[0]), makeFb(gl, texs[1]) ];

  // Triangle vertex positions for vertex shader
  attributeSetFloats(gl, prog, "pos", 3, [
	 -1, 1, 0,
	 1, 1, 0,
	 -1, -1, 0,
	 1, -1, 0
  ]);

  const ctx = {
	 gl, // gl object
	 prog, // program (comprising frag and vert shaders) -- may not be used?
	 texs, // textures
	 fbs, // framebuffers
	 t: 0, // time index, i.e. frame number
	 going: false // are we actively computing new frames?
  };

  return ctx;
}

function drawWith(ctx) {
  const {gl, prog, texs, fbs, t} = ctx;

  gl.activeTexture(gl.TEXTURE0);

  const out_fb = ctx.t % 2; // index of framebuffer to render into
  const in_tex = 1 - out_fb; // index of texture to use as input

  gl.bindTexture(gl.TEXTURE_2D, texs[in_tex]);

  // render to framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbs[out_fb]);
  gl.viewport(0, 0, TEX_W, TEX_H);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // render to canvas
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, TEX_W, TEX_H);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  ctx.t++;
}

function tick(ctx) {
  drawWith(ctx);
  if (ctx.going) {
	 requestAnimationFrame(() => tick(ctx));
  }
}

async function go() {
  const vert = await grabTextResource('vertex.vert');
  const frag = await grabTextResource('fragment.frag');

  const canvas = document.getElementsByTagName('canvas')[0];

  try {
	 const ctx = setupContext(vert, frag);
	 drawWith(ctx);
	 canvas.onmousedown = () => {
		if (ctx.going) {
		  ctx.going = false;
		}
		else {
		  ctx.going = true;
		  requestAnimationFrame(() => tick(ctx));
		}
	 };
  } catch (e) {
	 throw e;
  }
}
