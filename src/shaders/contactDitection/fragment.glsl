uniform sampler2D tDiffuse;
uniform sampler2D tContactDitectionDiffuse;

varying vec2 vUv;

#include ../utils/blend.glsl
#include ../utils/gamma.glsl
#include ../utils/sRGB.glsl

void main() {
  // Original color
  vec4 originalColor = texture2D(tDiffuse, vUv);
  // originalColor.rgb = gammaCorrect(originalColor.rgb, 2.2);
  originalColor.rgb = linearToSRGB(originalColor.rgb);

  //接触判定部分の色
  vec4 contactDitectionDiffuse = texture2D(tContactDitectionDiffuse, vUv);
  contactDitectionDiffuse.rgb = gammaCorrect(contactDitectionDiffuse.rgb, 2.2);
  // contactDitectionDiffuse.rgb = linearToSRGB(contactDitectionDiffuse.rgb);

  //-------接触判定部分にエフェクトを追加

  // 2つの色を合成

  // color = originalColor.rgb * 0.5;
  // vec3 color = contactDitectionDiffuse.rgb;
  // // 2つの色を合成
  vec3 color = blendLighten(contactDitectionDiffuse.rgb, originalColor.rgb, .5);

  gl_FragColor = vec4(color, 1.0);

}