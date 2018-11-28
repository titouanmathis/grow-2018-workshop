precision highp float;

uniform float time;
uniform float aspect;
uniform vec2 pointer;
uniform float maskSize;
varying vec2 vUv;
uniform sampler2D texture;

#pragma glslify: noise = require('glsl-noise/simplex/3d');

void main () {
	float d = 1.0;

	vec2 coord = vUv - 1.0 + pointer;
	coord.x *= aspect;
	float dist = length(coord);
	dist += 1.0 * noise(vec3(vUv * 1.5, time * 0.125));
	dist += 0.9 * noise(vec3(vUv * 3.0, time * 0.25));
	dist -= 0.01 * noise(vec3(vUv * 2000.0, time * 5.0));
	dist -= 0.05 * noise(vec3(vUv * 1000.0, time * 2.0));
	dist += 0.005 * noise(vec3(vUv * 100.0, time * 1.0));
	dist += 0.05 * noise(vec3(vUv * 12.0, time * 1.0));
	dist -= 0.09 * noise(vec3(vUv * 6.0, time * 0.5));
	float mask = smoothstep(maskSize + 0.6, maskSize, dist);

  vec4 texColor = texture2D(texture, vUv).rgba;
  gl_FragColor = vec4(texColor.rgb, mask);
}