uniform float cameraNear;
uniform float cameraFar;
uniform float time;
uniform float uContactIntensity;
uniform float hasContact;
uniform vec2 uResolution;
uniform vec3 contactPoint;

uniform sampler2D tDepth;

varying float vCamaraDistance;
varying vec2 vUv;
varying vec3 vWorldPosition;

#include ../utils/readDepth.glsl
#include ../utils/blend.glsl

void main() {

  vec2 fragCoord = gl_FragCoord.xy / uResolution.xy;

  //カメラからの距離を正規化
  float normalizedDistance = (vCamaraDistance - cameraNear) / (cameraFar - cameraNear);

 //深度値
  float depth = readDepth(tDepth, fragCoord);

   //接触判定 -> 球体を除外した深度値 - カメラからの距離 = 接触量
  float contactAmount = depth - normalizedDistance;

  //接触量を最大値にはじく閾値
  float contactDetectEdge = 0.01;

  float contactDiffuseValue = smoothstep(0.0, contactDetectEdge, contactAmount);

  //球体の接触判定
  float distanceFromContact = clamp(length(vWorldPosition - contactPoint), 0.0, 1.0);//clampしておかないと、影響範囲が制限できない。

  //------- デバッグ -------
  vec3 depthColor = vec3(1.0 - depth);
  vec3 distanceColor = vec3(1.0 - normalizedDistance);
  vec3 contactColor = vec3(1.0 - contactDiffuseValue);
  vec3 distanceFromContactColor = vec3(1.0 - distanceFromContact) * uContactIntensity;

  vec3 test = contactColor + distanceFromContactColor;
  // test = vec3(fragCoord, 0.0);

  //------- 出力 -------
  vec3 color = test;

  gl_FragColor = vec4(color, 1.0);

}