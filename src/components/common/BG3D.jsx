import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function BG3D() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const particlesGeo = new THREE.BufferGeometry()
    const count = 300
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      sizes[i] = Math.random() * 3 + 1
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const textureCanvas = document.createElement('canvas')
    textureCanvas.width = 32
    textureCanvas.height = 32
    const ctx = textureCanvas.getContext('2d')
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255, 90, 31, 1)')
    gradient.addColorStop(0.3, 'rgba(255, 122, 45, 0.6)')
    gradient.addColorStop(1, 'rgba(255, 90, 31, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)
    const particleTexture = new THREE.CanvasTexture(textureCanvas)

    const particlesMat = new THREE.PointsMaterial({
      size: 0.08,
      map: particleTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.6,
    })
    const particles = new THREE.Points(particlesGeo, particlesMat)
    scene.add(particles)

    const geometry = new THREE.IcosahedronGeometry(2, 1)
    const material = new THREE.MeshBasicMaterial({
      color: 0xFF5A1F,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    })
    const wireframeSphere = new THREE.Mesh(geometry, material)
    wireframeSphere.position.set(2, -1, -3)
    scene.add(wireframeSphere)

    const geometry2 = new THREE.IcosahedronGeometry(1.5, 1)
    const material2 = new THREE.MeshBasicMaterial({
      color: 0xFF7A2D,
      wireframe: true,
      transparent: true,
      opacity: 0.04,
    })
    const wireframeSphere2 = new THREE.Mesh(geometry2, material2)
    wireframeSphere2.position.set(-2.5, 1.5, -4)
    scene.add(wireframeSphere2)

    camera.position.z = 6

    let mouseX = 0
    let mouseY = 0
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      particles.rotation.y += 0.0008
      particles.rotation.x += 0.0003
      wireframeSphere.rotation.x += 0.002
      wireframeSphere.rotation.y += 0.004
      wireframeSphere2.rotation.x -= 0.003
      wireframeSphere2.rotation.y += 0.002
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02
      camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.02
      camera.lookAt(scene.position)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div id="bg-3d" ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }} />
}
