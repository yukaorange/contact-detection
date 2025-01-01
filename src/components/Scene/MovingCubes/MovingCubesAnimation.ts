import * as THREE from 'three'
import type { CubeConfig } from './MovingCubes'

export const animateGroup = (
  group: THREE.Group,
  config: CubeConfig,
  time: number,
  initialPosition: THREE.Vector3,
) => {
  if (!config.animation?.enabled) return

  const animation = config.animation

  // オブジェクトの回転処理
  if (animation.rotationEnabled && animation.rotationSpeed) {
    group.rotation.x += animation.rotationSpeed[0]
    group.rotation.y += animation.rotationSpeed[1]
    group.rotation.z += animation.rotationSpeed[2]
  }

  // 移動アニメーション処理
  switch (animation.type) {
    case 'linear': {
      const { axis, amplitude, frequency, phase = 0 } = animation
      const movement = Math.sin(time * frequency + phase) * amplitude
      switch (axis) {
        case 'x':
          group.position.x = initialPosition.x + movement
          break
        case 'y':
          group.position.y = initialPosition.y + movement
          break
        case 'z':
          group.position.z = initialPosition.z + movement
          break
      }
      break
    }
    case 'circular': {
      const {
        plane,
        radius,
        speed,
        phase = 0,
        centerOffset = [0, 0, 0],
      } = animation
      const angle = time * speed + phase

      switch (plane) {
        case 'xy':
          group.position.x =
            initialPosition.x + centerOffset[0] + Math.cos(angle) * radius
          group.position.y =
            initialPosition.y + centerOffset[1] + Math.sin(angle) * radius
          break
        case 'yz':
          group.position.y =
            initialPosition.y + centerOffset[1] + Math.cos(angle) * radius
          group.position.z =
            initialPosition.z + centerOffset[2] + Math.sin(angle) * radius
          break
        case 'xz':
          group.position.x =
            initialPosition.x + centerOffset[0] + Math.cos(angle) * radius
          group.position.z =
            initialPosition.z + centerOffset[2] + Math.sin(angle) * radius
          break
      }
      break
    }
    case 'custom': {
      animation.animate(time, group, initialPosition)
      break
    }
  }
}
