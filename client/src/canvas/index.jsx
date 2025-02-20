import { Canvas } from "@react-three/fiber";
import { Center, Environment } from '@react-three/drei'
import CameraRig from "./CameraRig";
import Modelo3D from "./Modelo3D";
import Backdrop from './Backdrop';

const CanvasModel = () => {
  return (
    <Canvas
    shadows
    camera={{position:[0,0,0], fov:25}}
    gl={{preserveDrawingBuffer:true}}
    className="w-full max-w-full h-full transition-all ease-in">
        {/* <ambientLight  intensity={0.5} /> */}
        {/* <hemisphereLight args={['#fff', '#333']} /> */}
        {/* <Environment preset="forest" background backgroundBlurriness={0.5} /> */}
        <directionalLight position={[0, 0.5, 5]} intensity={Math.PI/2}/>
        <CameraRig >
          <Backdrop/>
          <Center>
            <Modelo3D/>
          </Center>
        </CameraRig>
    </Canvas>
  )
}

export default CanvasModel