varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);

  vec4 viewPosition = viewMatrix * worldPosition;

  vWorldNormal = normalize(normalMatrix * normal);

  vec3 vWorldPosition = worldPosition.xyz;

  gl_Position = projectionMatrix * viewPosition;
}