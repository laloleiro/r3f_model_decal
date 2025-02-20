import { AccumulativeShadows, RandomizedLight } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { easing } from "maath"
import { useRef } from "react"


const Backdrop = () => {
  const shadows = useRef();
  return (
    <AccumulativeShadows 
      ref={shadows}
      fames={60}
      temporal
      alphaTest={0.85}
      scale={10}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0,0,-0.14]}>
      <RandomizedLight 
        amount={4}
        radius={9}
        intensity={0.55}
        ambient={0.25}
        position={[5,5,-10]}
      />
    </AccumulativeShadows>
  )
}

export default Backdrop