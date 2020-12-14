#version 300 es

precision mediump float;
out vec4 outputColor;
uniform vec2 u_canvasSize;
uniform sampler2D u_texture;

vec4 get_sample(int x, int y) {
  return texture(u_texture, (gl_FragCoord.xy + vec2(ivec2(x, y))) / u_canvasSize);
}

// normalize a vector to the circle centered at (0.5, 0.5) with radius 0.5
vec2 norm(vec2 v) {
  float x = v.x - 0.5;
  float y = v.y - 0.5;
  float len = 2.0 * sqrt(x * x + y * y);
  return vec2(x / len + 0.5, y / len + 0.5);
}

void main() {
  vec4 avg = (get_sample(0,-1) + get_sample(0,0) + get_sample(0,1) +
				  get_sample(1,-1) + get_sample(1,0) + get_sample(1,1) +
				  get_sample(-1,-1) + get_sample(-1,0) + get_sample(-1,1)) / 9.0;
  vec2 normed = norm(avg.rg);
  outputColor = vec4(normed, 0.0, 1.0);
}
