uniform float uTime;
uniform float uRenderContactDitection;
uniform float uGridItteration;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  vec3 color;
  //------- チェッカーボード
  float CHECKER_SIZE = 16.0;
  vec2 checkerCoord = floor(CHECKER_SIZE * uv);

  float checkerPattern = mod(checkerCoord.x + checkerCoord.y, 2.0);

  checkerPattern += 0.5;//暗い部分を明るくする
  checkerPattern *= 0.1;//そこからさらに全体的に暗くする

  vec3 checkerColor = vec3(checkerPattern);

  color = checkerColor;

  if(uRenderContactDitection == 1.0) {
    color = vec3(0.0);
  }

  gl_FragColor = vec4(color, 1.0);

}