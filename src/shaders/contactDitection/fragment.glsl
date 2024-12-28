uniform float uGridItteration;
uniform float uAspect;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;
uniform sampler2D tContactDitectionDiffuse;

varying vec2 vUv;

#include ../utils/blend.glsl
#include ../utils/grid.glsl

void main() {

  vec2 optimizedUv = vec2(vUv.x * uAspect, vUv.y);

  //------- グリッド
  vec3 gridDiffuse = vec3(createGrid(optimizedUv, vec2(uGridItteration), 0.06));
  vec3 gridColor = vec3(0.0, gridDiffuse.g, gridDiffuse.b);

  //------- Original color
  vec4 originalDiffuse = texture2D(tDiffuse, vUv);
  vec3 originalColor = originalDiffuse.rgb;

  //-------接触判定部分の色
  vec4 contactDitectionDiffuse = texture2D(tContactDitectionDiffuse, vUv);
  vec3 contactDitectionColor = contactDitectionDiffuse.rgb;

  //-------接触判定部分とグリッドを合成(接触グリッド)
  vec3 contactDitectionAndGrid = blendOverlay(contactDitectionColor, gridColor, 1.0);
  //明度を調整
  contactDitectionAndGrid *= 2.4;

  // ------- Original colorと接触グリッドを合成
  vec3 color = blendLighten(contactDitectionAndGrid, originalColor, .5);

  gl_FragColor = vec4(color, 1.0);

}