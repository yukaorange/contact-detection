varying float vCamaraDistance;
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);

  vec4 viewPosition = viewMatrix * worldPosition;

  vec3 worldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

  vCamaraDistance = -viewPosition.z;
  vWorldPosition = worldPosition.xyz;

  gl_Position = projectionMatrix * viewPosition;
}