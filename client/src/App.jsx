import { useRef } from "react"
import Canvas from './canvas';
import Customizer from './pages/Customizer';
import Home from './pages/Home';


const App = () => {

  const canvasRef = useRef();

  return (
      <main className="app transition-all ease-in">
        <Home/>
        <Canvas canvasRef={canvasRef} />
        <Customizer canvasRef={canvasRef}/>
      </main>
  )
}

export default App
