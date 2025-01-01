uniform float uTime;
uniform float uRenderContactDitection;
uniform vec2 uResolution;
uniform sampler2D tContactDitectionTexture;

varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

#include ../utils/grid.glsl
#include ../utils/blur.glsl

void main() {
  vec3 normal = normalize(vWorldNormal);

  vec2 fragCoord = gl_FragCoord.xy / uResolution.xy;

  vec3 color;

  //-------ライティング
  vec3 baseLightColor = vec3(1.0, 1.0, 1.0);

  //ライトの位置
  vec3 lightPosition = vec3(0.0, 5.0, 0.0);

  //ライトの方向
  vec3 lightDirection = normalize(lightPosition - vWorldPosition);

  //カメラの方向
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);

  //ライトとの距離
  float distance = length(lightPosition - vWorldPosition);

  //減衰
  // float attenuation = 1.0 / (1.0 + 0.045 * distance + 0.032 * distance * distance);
  // 緩やかな減衰（広い範囲で明るい）
  // float attenuation = 1.0 / (1.0 + 0.045 * distance + 0.0075 * distance * distance);
  // 急な減衰（狭い範囲でスポットライト的な効果）
  float attenuation = 1.0 / (1.0 + 0.22 * distance + 0.20 * distance * distance);

  //拡散反射
  float diffuse = max(dot(normal, lightPosition), 0.0);

  //スペキュラー反射
  vec3 halfVector = normalize(lightDirection + viewDirection);

  float specular = pow(max(dot(normal, halfVector), 0.0), 24.0);//法線とハーフベクトルの内積を取ることで、光源と視線の角度の平均を表すスペキュラーを計算できる。角度が水平に近いときにスペキュラーが強くなる。べき乗の値を大きくすると、スペキュラーが小さくなり、より輝きの範囲をしぼることができる。

  //ライティングの色を決定
  vec3 lightColor = baseLightColor * (diffuse + specular) * attenuation;

  //-------接触判定部分の色
  vec2 texelSize = 1.0 / uResolution;

  vec3 contactDitectionColor = applyBlur(tContactDitectionTexture, fragCoord, texelSize, 4.8);

  //------- グリッド線
  vec3 baseGrid = vec3(createGrid(vUv, vec2(12.0, 8.0), 0.064));

 // 発光効果
  vec3 glowColor = vec3(0.0, 1.0, 1.0);

  vec3 glowGrid = baseGrid * glowColor;

  vec3 gridColor = baseGrid + glowGrid;

  //-------接触判定部分とグリッドを合成(接触グリッド)

  color = vec3(0.33);

  color += lightColor;

  color += (contactDitectionColor * 10.0) * (gridColor * 0.64);

  color += (contactDitectionColor * 0.4) * glowColor;

  if(uRenderContactDitection == 1.0) {
    color = vec3(0.0, 0.0, 0.0);
  }

  gl_FragColor = vec4(color, 1.0);

}