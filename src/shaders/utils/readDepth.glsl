float perspectiveDepthToViewZ(float invClipZ, float near, float far) {
  return (near * far) / ((far - near) * invClipZ - far);
}

float viewZToOrthographicDepth(float viewZ, float near, float far) {
  return (viewZ + near) / (near - far);
}

float readDepth(sampler2D depthSampler, vec2 coord) {
  float fragCoordZ = texture2D(depthSampler, coord).x;

  float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);//cameraNear と cameraFar はuniformsで定義している（インポート先で参照できる）

  return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
}
