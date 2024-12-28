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

void main() {

  vec2 fragCoord = gl_FragCoord.xy / uResolution.xy;

  vec4 baseColor = vec4(0.031, 0.0, 0.078, 1.0); // #080014

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
  float contactDetectEdge = 0.03;

  //閾値を使った値のスムージング
  float contactDiffuseValue = smoothstep(0.0, contactDetectEdge, contactAmount);

  //------- 球体の衝突判定
  float distanceFromContact = clamp(length(vWorldPosition - contactPoint), 0.0, 1.0);//clampしておかないと、影響範囲が制限できない。

  //------- デバッグ -------
  vec3 depthColor = vec3(depth, 0.0, 0.0);
  vec3 distanceColor = vec3(normalizedDistance, 0.0, 0.0);
  vec3 testDistanceColor = vec3(distanceFromContact);
  vec3 contactColor = vec3(1.0 - contactDiffuseValue);
  vec3 testContactColor = vec3(contactAmount);
  vec3 distanceFromContactColor = vec3(1.0 - distanceFromContact) * uContactIntensity;
  vec3 fresnelColor = vec3(fresnelValue);

  vec3 test;
  // test = depthColor;
  // test = distanceColor;
  // test = testContactColor;
  // test = contactColor;
  // test += distanceFromContactColor;
  // test = vec3(fragCoord, 0.0);
  // test = background.rgb;
  // test *= baseColor.rgb;
  // test += baseColor.rgb * 0.5;
  // test = contactColor;
  test = fresnelColor;

  //------- 出力 
  vec3 color;

  // color = test;

  color += fresnelColor;
  color += distanceFromContactColor;
  color += baseColor.rgb;

  //------- 透明度
  float alpha = baseColor.a;

  //-------接触判定のみの出力
  if(uRenderContactDitection == 1.0) {
    color = contactColor;
    alpha = 0.2;
  }

  gl_FragColor = vec4(color, alpha);

}