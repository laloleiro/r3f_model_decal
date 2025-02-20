import express from "express";
import * as dotenv from 'dotenv';
import cors from 'cors';
import {AIHorde} from '@zeldafan0225/ai_horde'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({limit: "50mb" }))

// https://stablehorde.net/api/v2/generate/async

// const ai_horde = new AIHorde({
//     cache_interval: 1000 * 10,
//     cache: {
//       generations_check: 1000 * 30,
//     },
//     client_agent: "My-Project:v0.0.1:My-Contact"
//   });


const aiHorde = new AIHorde({
    client_agent: "loadAIImages-demo:v1.0.0:laulilolaloleiro3@gmail.com",
  });

const generateImage = async (prompt) => {
try {
    console.log("Starting image generation with prompt:", prompt);
    const generation = await aiHorde.postAsyncImageGenerate({
      prompt: prompt,
      params: {
        sampler_name: "k_dpmpp_2m",
        cfg_scale: 7.5,
        width: 512,
        height: 512,
        steps: 30,
        karras: false,
        post_processing: ["GFPGAN"]
      },
      apikey: process.env.HORDE_API_KEY,
    });

    console.log("Generation request submitted, ID:", generation.id);
    // Poll for the generation status
    let check;
    let attempts = 0;
    const maxAttempts = 30;
    do {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      check = await aiHorde.getImageGenerationCheck(generation.id);
      //console.log("Checking generation status:", check);
      attempts++;
    } while (check.done === false && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Image generation timed out: MAX Attemps reached');
    }

    console.log("Final check result:", JSON.stringify(check, null, 2));

     // Retrieve the actual image generation status
     const status = await aiHorde.getImageGenerationStatus(generation.id);
     console.log("Image generation status:", JSON.stringify(status, null, 2));
 
     if (!status.generations || status.generations.length === 0) {
       throw new Error('No generations received from AI Horde');
     }
 
     const imageUrl = status.generations[0]?.img;
     if (!imageUrl) {
       throw new Error('No image URL found in the generation result');
     }

    console.log("Image URL generated:", imageUrl);
    return imageUrl;

} catch (error) {
    console.error("Error generating image:", error);
    throw error;
}
};

app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
  
      const imageUrl = await generateImage(prompt);
      
      if (!imageUrl) {
        return res.status(500).json({ error: 'Failed to generate image' });
      }
    res.status(200).json({ imageUrl });
    
  } catch (error) {
      console.error('Error in image generation endpoint:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });


/*
app.use('/api/v1/dalle', dalleRoutes);

app.get('/', (req, res)=> {
    res.status(200).json({ message: "hello world from DALL:e"})
})
*/

app.listen(8080, () => console.log('Server has started on port 8080'))