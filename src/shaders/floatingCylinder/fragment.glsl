uniform float uTime;
uniform float uRenderContactDitection;
uniform vec2 uResolution;
uniform sampler2D tContactDitectionTexture;

varying vec2 vUv;

void main() {
  vec2 fragCoord = gl_FragCoord.xy / uResolution.xy;
  vec3 color;

  vec4 contactDitectionDiffuse = texture2D(tContactDitectionTexture, fragCoord);

  color = vec3(0.33);

  color += contactDitectionDiffuse.rgb;

  if(uRenderContactDitection == 1.0) {
    color = vec3(0.0, 0.0, 0.0);
  }

  gl_FragColor = vec4(color, 1.0);

}