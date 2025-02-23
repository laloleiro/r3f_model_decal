import {useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSnapshot } from 'valtio'

import state from '../store';
import { download } from '../assets';
import { downloadCanvasToImage, reader } from '../config/helpers';
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants'

import { fadeAnimation, slideAnimation } from '../config/motion';
import { AIPicker, ColorPicker, CustomButton, FilePicker, Tab } from '../components'


const Customizer = () => {
  const snap = useSnapshot(state);

  const [file, setFile] = useState('');

  const [prompt, setPrompt] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [generatingImg, setGeneratingImg] = useState(false);
  
  const [activeEditorTab, setActiveEditorTab] = useState('')
  const [activeFilterTab, setActiveFilterTab] = useState({
      logoShirt: true,
      stylishShirt: false
  })

  //show tab content depending on the activeTab
  const generateTabContent = () => {
      switch (activeEditorTab) {
          case 'colorpicker':
              return <ColorPicker isOpen={true} onClose={() => setActiveEditorTab('')} />;
          case 'filepicker':
              return <FilePicker 
                file={ file } 
                setFile={ setFile }
                readFile= { readFile }
                />
          case 'aipicker':
              return <AIPicker
              prompt={prompt} 
              setPrompt={setPrompt}
              generatingImg={generatingImg}
              handleSubmit={handleSubmit}/>
          default:
              return null;
      }
  }

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        //const response = await fetch('http://localhost/bananaweb/r3f_model_decal/server/api.php?csrf-token', {
        const response = await fetch('https://laloleiro.com/react3fiber/model_decal/server/api.php?csrf-token', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCsrfToken(data.csrfToken);
       } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };
  
    fetchCsrfToken();
  }, []);

  const handleSubmit = async (type) => {
    if( !prompt ) return alert("Please enter a prompt");
  
    try {
      setGeneratingImg(true);

      //const response = await fetch('http://localhost/bananaweb/r3f_model_decal/server/api.php', {
      const response = await fetch('https://laloleiro.com/react3fiber/model_decal/server/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        credentials:'include',
        body: JSON.stringify({ prompt }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');  
      }
  
      const data = await response.json();
      handleDecals(type, data.imageUrl)
      
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    } finally {
          setGeneratingImg(false);
          setActiveEditorTab("");
        }
  };

  const handleDecals = ( type, result ) => {

    const decalType = DecalTypes[type]; 

    state[decalType.stateProperty] = result;

    if(!activeFilterTab[decalType.filterTab]){
      handleActiveFilterTab(decalType.filterTab)
    }
  }

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case "logoShirt":
          state.isLogoTexture = !activeFilterTab[tabName];
        break;
      case "stylishShirt":
          state.isFullTexture = !activeFilterTab[tabName];
        break;
      default:
        state.isLogoTexture = true;
        state.isFullTexture = false;
        break;
    }
    //after setting the state, activeFilterTab is updated
    setActiveFilterTab((prevState)=> {
      return {
        ...prevState,
        [tabName]: !prevState[tabName]
      }
    })
  }

  const readFile = (type) => {
    reader(file)
      .then((result) => {
        handleDecals(type, result);
        setActiveEditorTab("");
      })
  }

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key="custom"
            className='absolute top-0 left-0 z-10'
            { ...slideAnimation('left') }
          >
            <div className='flex items-center min-h-screen'>
              <div className='editortabs-container tabs'>
                {EditorTabs.map((tab)=> (
                  <Tab 
                    key={tab.name}
                    tab={tab}
                    handleClick={()=>{ setActiveEditorTab(tab.name)}}
                  ></Tab>
                ))}
                { generateTabContent() }
              </div>
            </div>
          </motion.div>

          <motion.div className="absolute z-10 top-5 right-5"
          { ...fadeAnimation}>
            <CustomButton
              type="filled"
              title="Go Back"
              handleClick={()=> state.intro = true }
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            ></CustomButton>
          </motion.div>

         <motion.div 
          className='filtertabs-container' {...slideAnimation('up')}>
              {FilterTabs.map((tab)=> (
                  <Tab 
                    key={ tab.name }
                    tab={ tab }
                    isFilterTab
                    isActiveTab={ activeFilterTab[tab.name] }
                    handleClick={()=> handleActiveFilterTab(tab.name)}
                  ></Tab>
                ))}
          </motion.div>

        </>
      )}
    </AnimatePresence>
  )
}

export default Customizer