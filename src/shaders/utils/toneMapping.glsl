vec3 toneMapping(vec3 hdrColor) {
    // 輝度の計算 (人間の目の感度に基づいた重み付け)
  float luminance = dot(hdrColor, vec3(0.2126, 0.7152, 0.0722));

    // 標準的なReinhard トーンマッピング
  vec3 toneMappedColor = hdrColor / (hdrColor + 1.0);

    // 輝度ベースとカラーベースのトーンマッピングを合成
  return mix(hdrColor / (luminance + 1.0), toneMappedColor, toneMappedColor);
}