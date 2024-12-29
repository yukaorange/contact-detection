// 2次元座標から3次元のランダム値を生成する関数
vec3 generateRandomVector(vec2 point) {
  vec3 randomValues = vec3(dot(point, vec2(127.1, 311.7)), dot(point, vec2(269.5, 183.3)), dot(point, vec2(419.2, 371.9)));
  return fract(sin(randomValues) * 43758.5453);
}

// position: 計算する座標
float voronoi(vec2 position) {
  vec2 cellId = floor(position);
  vec2 localPos = fract(position);

  float minDist = 1.0;  // 最も近い点までの距離を追跡
  float cellValue = 0.0;  // セルの値

    // より広い範囲のセルをチェックして角張りを改善
  for(int y = -2; y <= 2; y++) {
    for(int x = -2; x <= 2; x++) {
      vec2 neighbor = vec2(x, y);
      vec3 randomVector = generateRandomVector(cellId + neighbor);

      vec2 distanceVector = neighbor - localPos + randomVector.xy;
      float dist = length(distanceVector);

            // 最小距離の更新
      if(dist < minDist) {
        minDist = dist;
        cellValue = randomVector.z;
      }
    }
  }

    // より鋭い境界を作成
  return cellValue;
}