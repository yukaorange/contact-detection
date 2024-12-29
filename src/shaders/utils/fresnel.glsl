float fresnel(vec3 eyeVector, vec3 worldNormal, float power, float thickness, float fallOff) {
  float fresnelFactor = abs(dot(eyeVector, worldNormal));

  float inversefresnelFactor = 1.0 - fresnelFactor;

  float fresnelValue = pow(inversefresnelFactor, power);

  float fresnelValueCutOff = smoothstep(1.0 - thickness - fallOff, 1.0 - thickness, fresnelValue);

  return fresnelValueCutOff;
}
