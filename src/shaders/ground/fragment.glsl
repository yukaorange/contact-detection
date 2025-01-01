uniform float uTime;
uniform float uRenderContactDitection;
uniform float uGridItteration;
uniform vec2 uResolution;

uniform sampler2D tContactDitectionTexture;

varying vec2 vUv;

#include ../utils/grid.glsl
#include ../utils/blur.glsl

void main() {
  vec2 uv = vUv;

  vec2 fragCoord = gl_FragCoord.xy / uResolution.xy;

  vec3 color;

  //-------接触判定部分の色
  vec2 texelSize = 1.0 / uResolution;

  vec3 contactDitectionColor = applyBlur(tContactDitectionTexture, fragCoord, texelSize, 4.8);

  //------- グリッド線
  vec3 baseGrid = vec3(createGrid(vUv, vec2(64.0, 64.0), 0.064));

 // 発光効果
  vec3 glowColor = vec3(0.0, 1.0, 1.0);

  vec3 glowGrid = baseGrid * glowColor;

  vec3 gridColor = baseGrid + glowGrid;

  //------- チェッカーボード
  float CHECKER_SIZE = 16.0;
  vec2 checkerCoord = floor(CHECKER_SIZE * uv);

  float checkerPattern = mod(checkerCoord.x + checkerCoord.y, 2.0);

  checkerPattern += 0.5;//暗い部分を明るくする
  checkerPattern *= 0.1;//そこからさらに全体的に暗くする

  vec3 checkerColor = vec3(checkerPattern);

  //-------色を確定
  color = checkerColor;

  color += (contactDitectionColor * 10.0) * (gridColor * 0.64);

  color += (contactDitectionColor * 0.4) * glowColor;

  if(uRenderContactDitection == 1.0) {
    color = vec3(0.0);
  }

  gl_FragColor = vec4(color, 1.0);

}