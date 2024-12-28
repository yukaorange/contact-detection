float rectSDF(vec2 uv, vec2 size, float intensity) {

  float rectColor;

  float bottom = 1.0 - step(uv.x, size.x);
  float left = 1.0 - step(uv.y, size.y);

  rectColor = bottom * left;

  rectColor = 1.0 - rectColor;

  rectColor *= intensity;

  return rectColor;
}

float cornerCrossSDF(vec2 uv, float size, float intensity) {
  float testSize = size;
  float crossColor = 0.0;

    // 左下のL字
  vec2 bottomLeft = uv;
  float bottomLeftVertical = step(0.0, bottomLeft.x) * step(bottomLeft.x, testSize) * step(0.0, bottomLeft.y) * step(bottomLeft.y, testSize * 4.0);

  float bottomLeftHorizontal = step(0.0, bottomLeft.x) * step(bottomLeft.x, testSize * 4.0) * step(0.0, bottomLeft.y) * step(bottomLeft.y, testSize);

  float bottomLeftShape = max(bottomLeftVertical, bottomLeftHorizontal);

    // 右下のL字
  vec2 bottomRight = vec2(1.0 - uv.x, uv.y);

  float bottomRightVertical = step(0.0, bottomRight.x) * step(bottomRight.x, testSize) * step(0.0, bottomRight.y) * step(bottomRight.y, testSize * 4.0);
  float bottomRightHorizontal = step(0.0, bottomRight.x) * step(bottomRight.x, testSize * 4.0) * step(0.0, bottomRight.y) * step(bottomRight.y, testSize);

  float bottomRightShape = max(bottomRightVertical, bottomRightHorizontal);

    // 左上のL字
  vec2 topLeft = vec2(uv.x, 1.0 - uv.y);

  float topLeftVertical = step(0.0, topLeft.x) * step(topLeft.x, testSize) * step(0.0, topLeft.y) * step(topLeft.y, testSize * 4.0);

  float topLeftHorizontal = step(0.0, topLeft.x) * step(topLeft.x, testSize * 4.0) * step(0.0, topLeft.y) * step(topLeft.y, testSize);

  float topLeftShape = max(topLeftVertical, topLeftHorizontal);

    // 右上のL字
  vec2 topRight = vec2(1.0 - uv.x, 1.0 - uv.y);

  float topRightVertical = step(0.0, topRight.x) * step(topRight.x, testSize) * step(0.0, topRight.y) * step(topRight.y, testSize * 4.0);

  float topRightHorizontal = step(0.0, topRight.x) * step(topRight.x, testSize * 4.0) * step(0.0, topRight.y) * step(topRight.y, testSize);

  float topRightShape = max(topRightVertical, topRightHorizontal);

  //---------- 全てのL字を合成 ----------
  // 下部の2つを合成
  float bottomShapes = max(bottomLeftShape, bottomRightShape);
  // 上部の2つを合成
  float topShapes = max(topLeftShape, topRightShape);
   // 上下を合成
  crossColor = max(bottomShapes, topShapes);

  crossColor *= intensity;

  return crossColor;
}

vec3 createGrid(
  vec2 uv,
  vec2 resolution,
  float lineWidth
) {
  vec3 color;

  // uv.x = uv.x - time * 0.004;//0.004
  // uv.y = uv.y + time * 0.004;//0.004

  uv *= resolution;

  vec2 gridUv = mod(uv, 1.0);

  float baseSquare = rectSDF(gridUv, vec2(lineWidth), 0.1);

  color = vec3(baseSquare);

  //今回はcornerのクロスは使わない
  // float crossColor = cornerCrossSDF(gridUv, 0.0064, 0.3);
  // color = vec3(crossColor + baseSquare);

  return color;
}

#pragma glslify: export(createGrid)