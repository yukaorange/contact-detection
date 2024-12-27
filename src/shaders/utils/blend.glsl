
//Overlay (オーバーレイ)
// 暗いベース色の上に明るいブレンド色を重ねると、やや明るくなる
// 明るいベース色の上に明るいブレンド色を重ねると、より明るくなる
// 暗いベース色の上に暗いブレンド色を重ねると、より暗くなる
// 明るいベース色の上に暗いブレンド色を重ねると、やや暗くなる果
//opacityの設定はブレンド効果の適用度合いとして現れる
float blendOverlay(float base, float blend) {
  return base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
  return vec3(blendOverlay(base.r, blend.r), blendOverlay(base.g, blend.g), blendOverlay(base.b, blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
  return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}

// Lighten (比較（明）)
// ベース色とブレンド色を比較して、より明るい方の色を採用
float blendLighten(float base, float blend) {
  return max(blend, base);
}

vec3 blendLighten(vec3 base, vec3 blend) {
  return vec3(blendLighten(base.r, blend.r), blendLighten(base.g, blend.g), blendLighten(base.b, blend.b));
}

vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
  return (blendLighten(base, blend) * opacity + base * (1.0 - opacity));
}

// Darken (比較（暗）)
// Lightenの逆で、ベース色とブレンド色を比較して、より暗い方の色を採用します
float blendDarken(float base, float blend) {
  return min(blend, base);
}

vec3 blendDarken(vec3 base, vec3 blend) {
  return vec3(blendDarken(base.r, blend.r), blendDarken(base.g, blend.g), blendDarken(base.b, blend.b));
}

vec3 blendDarken(vec3 base, vec3 blend, float opacity) {
  return (blendDarken(base, blend) * opacity + base * (1.0 - opacity));
}

// Pin Light (ピンライト)
// Darkenと Lightenを組み合わせた複雑なブレンドモードです
float blendPinLight(float base, float blend) {
  return (blend < 0.5) ? blendDarken(base, (2.0 * blend)) : blendLighten(base, (2.0 * (blend - 0.5)));
}

vec3 blendPinLight(vec3 base, vec3 blend) {
  return vec3(blendPinLight(base.r, blend.r), blendPinLight(base.g, blend.g), blendPinLight(base.b, blend.b));
}

vec3 blendPinLight(vec3 base, vec3 blend, float opacity) {
  return (blendPinLight(base, blend) * opacity + base * (1.0 - opacity));
}
