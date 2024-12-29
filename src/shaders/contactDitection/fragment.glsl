uniform float uGridItteration;
uniform float uAspect;
uniform float uBlurStrength;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;
uniform sampler2D tContactDitectionDiffuse;

varying vec2 vUv;

#include ../utils/blend.glsl
#include ../utils/grid.glsl
#include ../utils/blur.glsl

void main() {

  vec2 optimizedUv = vec2(vUv.x * uAspect, vUv.y);

  //------- グリッド線
  vec3 baseGrid = vec3(createGrid(optimizedUv, vec2(uGridItteration), 0.064));

 // 発光効果
  vec3 glow = baseGrid * vec3(0.0, 1.0, 1.0);

  vec3 gridColor = baseGrid + glow;

  //------- Original color
  vec4 originalDiffuse = texture2D(tDiffuse, vUv);

  vec3 originalColor = originalDiffuse.rgb;

  //-------接触判定部分の色
  vec2 texelSize = 1.0 / uResolution;

  vec3 contactDitectionColor = applyBlur(tContactDitectionDiffuse, vUv, texelSize, uBlurStrength);

  //-------接触判定部分とグリッドを合成(接触グリッド)
  vec3 contactDitectionAndGrid = blendOverlay(contactDitectionColor, gridColor, 1.0);

  //明度を調整
  contactDitectionAndGrid *= 4.8;

  // ------- Original colorと接触グリッドを合成
  vec3 color = blendLighten(contactDitectionAndGrid, originalColor, .5);

  gl_FragColor = vec4(color, 1.0);

}