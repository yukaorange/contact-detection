// RGB各チャンネルの重み
const vec3 COLOR_WEIGHTS = vec3(0.3, 0.3, 0.3);  
// 基本の色強度
const float BASE_INTENSITY = 0.12;

vec3 saturate(vec3 inputColor) {
    // 入力色の輝度値を計算
  float luminance = dot(inputColor, COLOR_WEIGHTS);

    // 色相と彩度の初期調整
  vec3 normalizedColor = inputColor / luminance * BASE_INTENSITY;

    // 輝度に基づく明るさの調整係数
  float brightnessScale = (1.0 - exp(-luminance)) * 0.9;

    // 彩度調整のための係数
  float saturationFactor = 1.0 - exp(-luminance * luminance / 10.0);

    // 彩度調整された色を計算
  vec3 adjustedColor = mix(normalizedColor, vec3(1.0), saturationFactor);

    // 最終的な強度調整
  float finalIntensity = mix(BASE_INTENSITY, 1.0, saturationFactor);

    // 最終出力を計算
  return brightnessScale * adjustedColor / finalIntensity;
}