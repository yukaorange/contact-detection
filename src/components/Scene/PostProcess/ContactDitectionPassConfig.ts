import vertexShader from '@/shaders/contactDitection/vertex.glsl'
import fragmentShader from '@/shaders/contactDitection/fragment.glsl'
import * as THREE from 'three'

export const ContactDitectionPassConfig = {
  uniforms: {
    tDiffuse: { value: null },
    tContactDitectionDiffuse: { value: null },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(0, 0) },
    uAspect: { value: 0 },
    uGridItteration: { value: 48 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
}
