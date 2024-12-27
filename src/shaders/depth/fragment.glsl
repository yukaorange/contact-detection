uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform float cameraNear;
uniform float cameraFar;
varying vec2 vUv;

void main() {

  vec3 color = vec3(vUv.x, vUv.y, 0.0);

  gl_FragColor = vec4(color, 1.0);

}