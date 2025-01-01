uniform float cameraNear;
uniform float cameraFar;
uniform float uTime;
uniform float uFresnelFactor;
uniform float uRenderContactDitection;
uniform float uContactIntensity;
uniform float uHasContact;
uniform vec2 uResolution;
uniform vec3 contactPoint;

uniform sampler2D tDepth;
uniform sampler2D tBackground;

varying float vCameraDistance;
varying float vWave;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vEyeVector;
varying vec3 vWorldNormal;

#include ../utils/readDepth.glsl
#include ../utils/blend.glsl
#include ../utils/fresnel.glsl
#include ../utils/rainbow.glsl
#include ../utils/snoise.glsl
#include ../utils/vonoroi.glsl
#include ../utils/discretizeTime.glsl

void main() {
  vec2 fragCoord = gl_FragCoord.xy / uResolution.xy;

  vec4 baseColor;
  baseColor = vec4(0.031, 0.0, 0.078, 1.0); // #080014
  // baseColor = vec4(0.09, 0.0, 0.22, 1.0); // mobile

  //------- ノイズ
  //フレネルと掛け合わせる虹色のためのノイズ
  float noise1 = snoise(vWorldPosition.xy * 0.140 + uTime * 0.240) * 1.0;
  float noise2 = snoise(vWorldPosition.yz * 0.20 + uTime * 0.218) * 1.0;
  float noise3 = snoise(vWorldPosition.zx * 0.16 + uTime * 0.351) * 1.0;

  float combinedNoise = (noise1 + noise2 + noise3) / 3.0;

  //--------疑似背景（ゆがみエフェクトで使用）
  vec4 background = texture2D(tBackground, fragCoord);

  //------- 色生成 

  //波の色
  vec3 waveColor = vec3(vWave);

  //-------レインボーカラー
  vec3 rainbowColor = generateRainbow(vWorldPosition.xz, uTime, combinedNoise);

  //------- 深度値とカメラ距離を使った接触判定
  //カメラからの距離を正規化
  float normalizedDistance = (vCameraDistance - cameraNear) / (cameraFar - cameraNear);

 //深度値
  float depth = readDepth(tDepth, fragCoord);

   //接触判定 -> 球体を除外した深度値 - カメラからの距離 = 接触量
  float contactAmount = depth - normalizedDistance;

  //接触量を最大値にはじく閾値
  float contactDetectEdge = 0.012;

  //postprocessのシーン用
  float contactDetectEdgeForGrid;

  if(vWorldPosition.y > 0.1) {
    contactDetectEdgeForGrid = 0.018;
  } else {
    //地面すれすれは色範囲狭く
    contactDetectEdgeForGrid = 0.018;
  }

  //閾値を使った値のスムージング
  float contactDiffuseValue = smoothstep(0.0, contactDetectEdge, contactAmount);
  float contactDiffuseValueForGrid = smoothstep(0.0, contactDetectEdgeForGrid, contactAmount);

  //接触判定の色（ベース）
  vec3 contactColor = vec3(1.0 - contactDiffuseValue) * rainbowColor * 0.064;

  vec3 contactColorForGrid = vec3(1.0 - contactDiffuseValueForGrid) ;

  //------- 衝突判定の色(今はまだベース職のみ。グリッチ的な加工を施したい)
  //衝突判定
  float distanceFromContact = clamp(length(vWorldPosition - contactPoint), 0.0, 1.0);//clampしておかないと、影響範囲が制限できない。

  vec3 distanceFromContactColor = vec3(1.0 - distanceFromContact) * uContactIntensity * baseColor.rgb;

  //-------フレネル反射の色

  //フレネル反射値を取得 
  float fresnelTickness = 0.64;
  float fresnelFallOff = 0.24;
  float fresnelValue = fresnel(vEyeVector, vWorldNormal, uFresnelFactor, fresnelTickness, fresnelFallOff);

  vec3 fresnelColor = vec3(fresnelValue);

  //-------フレネル反射部分でレインボーにする
  vec3 edgeColor = fresnelColor * rainbowColor;

  //-------等高線
  float threshold = 0.1;// パターンの密度を制御
  float frequency = 15.0;// パターンの繰り返し頻度

  //異なるUVでノイズを生成
  vec2 movingUv1 = vec2(vUv.x + noise1 * 0.001, vUv.y + noise2 * 0.001);
  vec2 movingUv2 = vec2(vUv.x - noise1 * 0.002, vUv.y + noise2 * 0.002);

  float n1 = snoise(movingUv1 * 7.0 + uTime * 0.1) * 0.5 + 0.5;
  float n2 = snoise(movingUv2 * 5.0 + uTime * 0.15) * 0.5 + 0.5;

  // ノイズを合成してパターンを作る
  float combinedN = mix(n1, n2, sin(uTime * 0.2) * 0.5 + 0.5);

  //時間によって周波数を変化させる
  float dynamicFrequency = frequency * (1.0 + sin(uTime * 0.3) * 0.2);

  //等高線パターンを生成
  float pattern = float(fract(combinedN * dynamicFrequency) < threshold);

  vec3 patternColor = vec3(pattern) * 0.01;

  //ベースカラーと組み合わせてダマスカス模様と命名
  vec3 damascusColor = baseColor.rgb + patternColor;

  //-------ボノロイカラー
  //離散化した時間経過を作成
  float discreteTime = mod(discretize(uTime, 0.2), 1.0);
  //y座標を正規化
  float heightFactor = normalize(vWorldPosition).y;

  //高さに応じてボノロイのスケールを調整
  float scale = mix(48.0, 24.0, heightFactor);  // 高さに応じてスケールを調整

  //離散化した時間を使って、ノイズ生成に使う座標をずらす
  vec2 offsetPosition = vWorldPosition.zx + vec2(discreteTime * 2.0, discreteTime * 1.5);

  //ボノロイパターンを生成
  float voronoiPattern = voronoi(scale * offsetPosition);

  //ボノロイパターンを閾値で切り抜く
  float vonoroiThreshold = 0.86;

  float maskedPattern = voronoiPattern > vonoroiThreshold ? 1.0 : 0.0;

  vec3 vonoroiColor = vec3(maskedPattern);

  //------- 出力 
  vec3 color;

  //フレネルの部分
  color += edgeColor;

  //接触判定の色
  if(vWorldPosition.y > 0.1) {
    //地面すれすれは色なし
    color += contactColor * vonoroiColor * (rainbowColor * 16.0);
  }

  //衝突判定の色
  color += distanceFromContactColor;
  color += waveColor;//衝突時の波の色

  //ダマスカス模様
  color += damascusColor;

  // color = rainbowColor;
  // color = vonoroiColor;

  //------- 透明度
  float alpha = baseColor.a;

  //-------接触判定のみの出力
  if(uRenderContactDitection == 1.0) {
    color = contactColorForGrid;
    alpha = 1.0;
  }

  gl_FragColor = vec4(color, alpha);

}