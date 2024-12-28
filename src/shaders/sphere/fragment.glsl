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
varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vEyeVector;
varying vec3 vWorldNormal;

#include ../utils/readDepth.glsl
#include ../utils/blend.glsl
#include ../utils/fresnel.glsl
#include ../utils/rainbow.glsl
#include ../utils/snoise.glsl

void main() {
  vec2 fragCoord = gl_FragCoord.xy / uResolution.xy;
  vec4 baseColor = vec4(0.031, 0.0, 0.078, 1.0); // #080014

  //------- ノイズ
  //フレネルと掛け合わせる虹色のためのノイズ
  float noise1 = snoise(vWorldPosition.xy * 0.240 + uTime * 0.240) * 1.0;
  float noise2 = snoise(vWorldPosition.yz * 0.20 + uTime * 0.238) * 1.0;
  float noise3 = snoise(vWorldPosition.zx * 0.16 + uTime * 0.151) * 1.0;
  float combinedNoise = (noise1 + noise2 + noise3) / 3.0;

  //--------疑似背景（ゆがみエフェクトで使用）
  vec4 background = texture2D(tBackground, fragCoord);

  //-------- フレネル反射値を取得 
  float fresnelValue = fresnel(vEyeVector, vWorldNormal, uFresnelFactor);

  //------- 深度値とカメラ距離を使った接触判定
  //カメラからの距離を正規化
  float normalizedDistance = (vCameraDistance - cameraNear) / (cameraFar - cameraNear);

 //深度値
  float depth = readDepth(tDepth, fragCoord);

   //接触判定 -> 球体を除外した深度値 - カメラからの距離 = 接触量
  float contactAmount = depth - normalizedDistance;

  //接触量を最大値にはじく閾値
  float contactDetectEdge = 0.018;

  //閾値を使った値のスムージング
  float contactDiffuseValue = smoothstep(0.0, contactDetectEdge, contactAmount);

  //------- 球体の衝突判定
  float distanceFromContact = clamp(length(vWorldPosition - contactPoint), 0.0, 1.0);//clampしておかないと、影響範囲が制限できない。

  //------- 色生成 -------
  //接触判定の色
  vec3 contactColor = vec3(1.0 - contactDiffuseValue);

  //レインボーカラー
  vec3 rainbowColor = generateRainbow(vWorldPosition.xz, uTime, combinedNoise);

  //フレネル反射の色
  vec3 fresnelColor = vec3(fresnelValue);

  //フレネル反射部分でレインボーにする
  vec3 edgeColor = fresnelColor * rainbowColor;

  //接触判定の色
  vec3 distanceFromContactColor = vec3(1.0 - distanceFromContact) * uContactIntensity;

  //等高線
  float threshold = 0.1;// パターンの密度を制御
  float frequency = 15.0;// パターンの繰り返し頻度

  vec2 movingUv = vec2(vUv.x + noise1 * 0.001, vUv.y + noise2 * 0.001);

  float noise = snoise(movingUv * 7.0 + uTime * 0.1) * 0.5 + 0.5;

  float pattern = float(fract(noise * frequency) < threshold);

  vec3 patternColor = vec3(pattern) * 0.02;

  vec3 damascusColor = baseColor.rgb + patternColor;

  //------- 出力 
  vec3 color;

  color += edgeColor;
  color += distanceFromContactColor;
  color += damascusColor;

  // color = rainbowColor;

  //------- 透明度
  float alpha = baseColor.a;

  //-------接触判定のみの出力
  if(uRenderContactDitection == 1.0) {
    color = contactColor;
    color += distanceFromContactColor * 0.64;
    alpha = 0.2;
  }

  gl_FragColor = vec4(color, alpha);

}