vec3 applyBlur(sampler2D tex, vec2 uv, vec2 texelSize, float strength) {
  vec3 color = vec3(0.0);
  float total = 0.0;

  float stride = strength;  

    // ブラーのサンプリング範囲
  for(float x = -4.0; x <= 4.0; x++) {
    for(float y = -4.0; y <= 4.0; y++) {
      vec2 offset = vec2(x, y) * texelSize * stride;
      float weight = exp(-(x * x + y * y) / 8.0);
      color += texture2D(tex, uv + offset).rgb * weight;
      total += weight;
    }
  }

  return color / total;
}
