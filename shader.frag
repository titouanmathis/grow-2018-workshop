precision highp float;

uniform float time;
uniform float aspect;
uniform vec2 pointer;
uniform float maskSize;
uniform float innerScale;
varying vec2 vUv;
uniform sampler2D texture;

#pragma glslify: noise = require('glsl-noise/simplex/3d');

void main () {
  vec2 uv = vUv - 0.5;
  uv.x *= aspect;
  vec2 coord = uv - 0.5 + pointer;
  float dist = length(coord);;
  dist += innerScale / 2.0 * noise(vec3(uv * 3.0, time * 0.25));
  dist -= 0.1 * noise(vec3(uv * 2000.0, time * 5.0));
  dist -= 0.09 * noise(vec3(uv * 1000.0, time * 2.0));
  dist += 0.05 * noise(vec3(uv * 12.0, time * 1.0));
  float mask = smoothstep(maskSize + 0.35, maskSize, dist);

  vec4 texColor = texture2D(texture, vUv).rgba;
  gl_FragColor = vec4(texColor.rgb, mask);
}