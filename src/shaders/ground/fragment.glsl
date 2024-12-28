uniform float uTime;
uniform float uGridItteration;

varying vec2 vUv;

#include ../utils/grid.glsl

void main() {
  vec4 gridColor = vec4(createGrid(vUv, vec2(uGridItteration)), 1.0);

  vec3 color = gridColor.rgb;

  color = vec3(0.02, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);

}