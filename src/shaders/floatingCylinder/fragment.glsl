uniform float uTime;
uniform float uRenderContactDitection;

varying vec2 vUv;

void main() {
  vec3 color;
  color = vec3(0.9, 0.13, 1.0);

  if(uRenderContactDitection == 1.0) {
    color = vec3(0.0, 0.0, 0.0);
  }

  gl_FragColor = vec4(color, 1.0);

}