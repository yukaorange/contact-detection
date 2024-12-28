varying float vCameraDistance;
varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vEyeVector;
varying vec3 vWorldNormal;

void main() {
  vUv = uv;

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);

  vec4 viewPosition = viewMatrix * worldPosition;

  //ワールド座標系における法線
  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  //ワールド座標系における位置
  vWorldPosition = worldPosition.xyz;
  //ワールド座標系におけるカメラの方向
  vEyeVector = normalize(worldPosition.xyz - cameraPosition);

  //ビュー座標系におけるカメラからの距離
  vCameraDistance = -viewPosition.z;

  gl_Position = projectionMatrix * viewPosition;
}