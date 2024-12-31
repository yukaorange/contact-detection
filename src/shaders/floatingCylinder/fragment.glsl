uniform float uTime;
uniform float uRenderContactDitection;
uniform vec2 uResolution;
uniform sampler2D tContactDitectionTexture;

varying vec2 vUv;

// #include ../utils/blend.glsl
#include ../utils/grid.glsl
#include ../utils/blur.glsl

void main() {
  vec2 fragCoord = gl_FragCoord.xy / uResolution.xy;
  vec3 color;

  //-------接触判定部分の色
  vec2 texelSize = 1.0 / uResolution;

  vec3 contactDitectionColor = applyBlur(tContactDitectionTexture, fragCoord, texelSize, 4.0);  

  //------- グリッド線
  vec3 baseGrid = vec3(createGrid(vUv, vec2(40.0), 0.064));

 // 発光効果
  vec3 glow = baseGrid * vec3(0.0, 1.0, 1.0);

  vec3 gridColor = baseGrid + glow;

  //-------接触判定部分とグリッドを合成(接触グリッド)

  color = vec3(0.33);

  color += contactDitectionColor * gridColor;

  if(uRenderContactDitection == 1.0) {
    color = vec3(0.0, 0.0, 0.0);
  }

  gl_FragColor = vec4(color, 1.0);

}