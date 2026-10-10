
import { GoogleGenAI, Type } from "@google/genai";
import { Item, Task, TaskType } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this game, we'll proceed and let the user see the error if they try to use a feature that needs it.
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateCreativeOrderPrompt = `
You are a movie theatre guest calling in a special order for your theatre.
Generate a single, creative order for a group of people watching a specific movie genre.
The order should have a fun, descriptive name and require a combination of items from the available list.

Available items: Soda, Water, Beer, Icee, Mixed Drink, Milkshake.

Respond with a JSON object that strictly follows this schema:
{
  "creativeName": "A descriptive, fun name for the order (e.g., 'The Action Hero's Fuel Pack')",
  "genre": "The movie genre the order is for (e.g., 'Action')",
  "requiredItems": ["An array of item names from the available list"]
}

Example:
{
  "creativeName": "Sci-Fi Voyage Rations",
  "genre": "Sci-Fi",
  "requiredItems": ["Soda", "Soda"]
}
`;

const stringToItem = (s: string): Item | null => {
    const normalized = s.toLowerCase().replace(/\s/g, '');
    switch (normalized) {
        case 'soda': return Item.Soda;
        case 'water': return Item.Water;
        case 'beer': return Item.Beer;
        case 'icee': return Item.Icee;
        case 'mixeddrink': return Item.MixedDrink;
        case 'milkshake': return Item.Milkshake;
        default: return null;
    }
}


export const geminiService = {
  generateCreativeOrder: async (): Promise<Omit<Task, 'id' | 'patience'>> => {
    if (!API_KEY) {
      console.log("No API key, returning a fallback order.");
      // Fallback for when API key is not available
      return {
        type: TaskType.DeliverToTheatre,
        description: "The 'Classic Combo' for Theatre 2",
        items: [Item.Soda, Item.Water],
        theatre: 2,
      };
    }

    try {
      // Use gemini-3-flash-preview for Basic Text Tasks like summarization or creative generation
      const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: generateCreativeOrderPrompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      creativeName: { type: Type.STRING },
                      genre: { type: Type.STRING },
                      requiredItems: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                      }
                  },
                  required: ["creativeName", "genre", "requiredItems"]
              }
          }
      });
      
      const jsonText = response.text.trim();
      const orderData = JSON.parse(jsonText);

      // Validate the response structure
      if (!orderData.creativeName || !Array.isArray(orderData.requiredItems)) {
        throw new Error("Invalid response structure from Gemini.");
      }
      
      const items: Item[] = orderData.requiredItems
        .map(stringToItem)
        .filter((item: Item | null): item is Item => item !== null);

      if (items.length === 0) {
        // If Gemini hallucinates items, provide a default
        items.push(Item.Soda, Item.Beer);
      }

      return {
        type: TaskType.DeliverToTheatre,
        description: `${orderData.creativeName}`,
        items: items,
        theatre: Math.floor(Math.random() * 5) + 1,
      };
    } catch (error) {
      console.error("Error generating creative order with Gemini:", error);
      // Return a fallback order on error
      return {
        type: TaskType.DeliverToTheatre,
        description: "The 'Horror Movie Survival Kit' for Theatre 4",
        items: [Item.Soda, Item.Water, Item.Milkshake],
        theatre: 4,
      };
    }
  },
};
