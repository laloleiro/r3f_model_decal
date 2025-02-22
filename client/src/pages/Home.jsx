import {AnimatePresence, motion } from 'framer-motion';
import { useSnapshot } from 'valtio';
import state from '../store';
import { CustomButton } from '../components';


import{ headContainerAnimation, 
    headContentAnimation,
    headTextAnimation,
    slideAnimation
} from '../config/motion';

const Home = () => {
    const snap = useSnapshot(state);
  return (
    <AnimatePresence>
        {snap.intro && (
            <motion.section className="home" {...slideAnimation('left')}>
                <motion.header {...slideAnimation("down")}>
                    <img src="./threejs.png" alt="logo" className='w-8 h-8 object-contain'/>
                </motion.header>

                <motion.div className="home-content" {...headContainerAnimation}>
                    <motion.div {...headTextAnimation}>
                        <h1 className='head-text'>R3fiber<br className='xl:block hidden'/>AI API</h1>
                    </motion.div>
                    <motion.div {...headContentAnimation} className='flex flex-col gap-5'>
                        <p className='max-w-md font-normal text-gray-600'>
                        3D Model customization demo. Image creation with AI Horde API v2 (bit slow, though).<br/>PHP * CORS.
                        <br/> <br/><strong>Unleash your imagination</strong>{" "} and define your own style.
                        </p>
                        <CustomButton
                            type="filled"
                            title="Customize IT"
                            handleClick={ () => state.intro = false }
                            customStyles="w-fit px-4 py-2.5 font-bold text-sm"
                        ></CustomButton>
                    </motion.div>
                </motion.div>
            </motion.section>
        )}
    </AnimatePresence>
  )
}

export default Home