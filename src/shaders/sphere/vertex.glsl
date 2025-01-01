varying float vCameraDistance;
varying float vWave;
varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vEyeVector;
varying vec3 vWorldNormal;

uniform float uTime;
uniform float uWaveRadius;
uniform float uWaveFrequency;
uniform float uWaveAmplitude;

uniform float uContactIntensities[4];
uniform vec3 uContactPoints[4];
uniform int uNumContacts;

void main() {
  vUv = uv;

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec3 worldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

  //-------複数の衝突点を考慮
  float totalWave = 0.0;

  for(int i = 0; i < 4; i++) {
    if(i >= uNumContacts)
      break;

    vec3 contactPoint = uContactPoints[i];
    float contactIntensity = uContactIntensities[i];

  //---衝突点との距離を計算 
    float distanceFromContactPoint = distance(worldPosition.xyz, contactPoint);

  //---衝突点からの距離によって、頂点の位置を変更
  //波
    float wave = 0.0;

    if(distanceFromContactPoint < uWaveRadius) {
    // 距離を0-1の範囲に正規化
      float normalizedDistance = distanceFromContactPoint / uWaveRadius;

    // 周波数
      wave = sin((normalizedDistance * uWaveFrequency) - (uTime * 10.0));

    // 波の振幅
      wave *= uWaveAmplitude;

    //端の方では波が小さくなる
      wave *= (1.0 - normalizedDistance);

    // 衝突点に近いほど波が大きくなる
      wave *= contactIntensity;
    }

     // 波の合成（最大値を採用）
    totalWave = max(totalWave, wave);
  }

  worldPosition.xyz += worldNormal * totalWave;

  vWave = totalWave;

  //------ ビュー座標
  vec4 viewPosition = viewMatrix * worldPosition;
  //------- プロジェクション座標
  gl_Position = projectionMatrix * viewPosition;

  //------- バイリング
  //ワールド座標系における法線
  vWorldNormal = worldNormal;
  //ワールド座標系における位置
  vWorldPosition = worldPosition.xyz;
  //ワールド座標系におけるカメラの方向
  vEyeVector = normalize(worldPosition.xyz - cameraPosition);
  //ビュー座標系におけるカメラからの距離
  vCameraDistance = -viewPosition.z;
}