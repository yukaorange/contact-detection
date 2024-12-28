vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);
  rgb = rgb * rgb * (3. - 2. * rgb);
  return c.z * mix(vec3(1.), rgb, c.y);
}

vec3 generateRainbow(vec2 pos, float time, float noiseValue) {
  //------- HSVパラメータ
  // ノイズの値を調整
  // noiseValue = pow(noiseValue, 10.1);

  // 色の範囲を選択
  float hue = noiseValue * 0.53 + 0.47;  

  // 彩度
  float saturation = 0.75;                     

  // 明度
  float value = 1.0;

  //------- グローの強さ
  // 中心からの距離
  float dist = length(pos);

  // グローの強さ
  float glowIntensity = 3.5 + sin(dist * 3.14 / 2.0); 

   // -------- HSVからRGBに変換
  vec3 baseColor = hsv2rgb(vec3(hue, saturation, value));

  return baseColor * glowIntensity;
}
