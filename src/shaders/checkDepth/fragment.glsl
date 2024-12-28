uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform float cameraNear;
uniform float cameraFar;

varying vec2 vUv;

#include ../utils/readDepth.glsl

void main() {
  // Original color
  vec4 diffuseColor = texture2D(tDiffuse, vUv);

  //深度値
  float depth = readDepth(tDepth, vUv);

  vec3 depthColor = vec3(1.0 - depth);

  vec3 color = depthColor;

  gl_FragColor = vec4(color, 1.0);

}