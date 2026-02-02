
import { GoogleGenAI, Type } from "@google/genai";
import { DeviceDesign, GroundingSource } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const sdsSchema = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING },
    casNumber: { type: Type.STRING },
    otherIdentifiers: { type: Type.STRING, description: "e.g. EPA Reg No or internal medical grade ID" },
    recommendedUse: { type: Type.STRING },
    supplierInfo: { type: Type.STRING, description: "Professional address and contact info" },
    emergencyContacts: { type: Type.STRING, description: "Medical/Transportation emergency numbers" },
    hazards: { type: Type.STRING },
    classification: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          class: { type: Type.STRING }
        },
        required: ["category", "class"]
      }
    },
    precautionaryStatements: {
      type: Type.OBJECT,
      properties: {
        prevention: { type: Type.ARRAY, items: { type: Type.STRING } },
        response: { type: Type.ARRAY, items: { type: Type.STRING } },
        storage: { type: Type.ARRAY, items: { type: Type.STRING } },
        disposal: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["prevention", "response", "storage", "disposal"]
    },
    pictograms: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "GHS pictogram names (e.g., 'Flame', 'Exclamation Mark')"
    },
    signalWord: { type: Type.STRING, enum: ["Danger", "Warning", "None"] },
    revisionDate: { type: Type.STRING },
    validationHash: { type: Type.STRING },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.NUMBER },
          heading: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ["id", "heading", "content"]
      },
      description: "Must contain exactly 16 objects following GHS standards."
    }
  },
  required: [
    "productName", "casNumber", "hazards", "classification", 
    "precautionaryStatements", "pictograms", "signalWord", 
    "revisionDate", "validationHash", "sections"
  ]
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    deviceName: { type: Type.STRING },
    deviceType: { 
      type: Type.STRING, 
      enum: ["CATHETER", "STENT", "BONE_PLATE", "GENERIC"]
    },
    materials: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          component: { type: Type.STRING },
          material: { type: Type.STRING },
          shore: { type: Type.STRING },
          propertiesAlignment: { type: Type.STRING },
          complianceFDA: { type: Type.STRING },
          toxicityStudies: { type: Type.STRING },
          availabilityNA: { type: Type.STRING },
          suppliersCMOs: { type: Type.ARRAY, items: { type: Type.STRING } },
          weldabilityAnalysis: { type: Type.STRING },
        },
        required: ["component", "material", "shore", "propertiesAlignment", "complianceFDA", "toxicityStudies", "availabilityNA", "suppliersCMOs", "weldabilityAnalysis"]
      }
    },
    sdsLibrary: { 
      type: Type.ARRAY, 
      items: sdsSchema
    },
    specs: {
      type: Type.OBJECT,
      properties: {
        od_mm: { type: Type.NUMBER },
        tolerance: { type: Type.STRING },
        wallThickness: { type: Type.NUMBER },
        bellowsCount: { type: Type.NUMBER },
        tendonChannelsCount: { type: Type.NUMBER },
        labels: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["od_mm", "tolerance", "wallThickness", "bellowsCount", "tendonChannelsCount"]
    },
    simulation: {
      type: Type.OBJECT,
      properties: {
        metrics: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING },
              unit: { type: Type.STRING },
              description: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["OPTIMAL", "CRITICAL", "WARNING"] }
            },
            required: ["label", "value", "unit", "description", "status"]
          }
        },
        engineeringSummary: { type: Type.STRING },
        safetyFactor: { type: Type.NUMBER }
      },
      required: ["metrics", "engineeringSummary", "safetyFactor"]
    }
  },
  required: ["deviceName", "deviceType", "materials", "sdsLibrary", "specs", "simulation"]
};

/**
 * Generates a stable numeric seed from a string input.
 */
function getStableSeed(str: string): number {
  let hash = 0;
  const normalized = str.toLowerCase().replace(/\s+/g, '');
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 1000000; 
}

export const generateDesign = async (prompt: string): Promise<DeviceDesign> => {
  const ai = getAI();
  
  const systemInstruction = `You are a Senior Medical Device Regulatory Engineer.
  TASK: Synthesize a professional technical design dossier.
  
  DETERMINISM PROTOCOL:
  - You MUST provide identical material selections and specifications for identical device inputs. 
  - Do not vary component naming conventions between runs (e.g., use "Outer Jacket" consistently for catheters).
  - Temperature is set to 0. Maintain extreme precision.
  
  SDS GENERATION RULES (STRICT):
  1. MIRROR INDUSTRY SAMPLES: Follow the 16-section SDS structure as seen in the Clorox/Medical Grade samples.
  2. IDENTIFICATION: Include specific supplier info, emergency contacts, and recommended uses.
  3. HAZARDS: Provide a granular Classification Table (Section 2) and grouped Precautionary Statements.
  4. SECTION CONTENT: Provide detailed technical content for all 16 sections.
  5. EXHAUSTIVE: 1 SDS record per material in the BOM.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0,
      seed: 42,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      thinkingConfig: { thinkingBudget: 32768 },
      tools: [{ googleSearch: {} }]
    },
  });

  const design = JSON.parse(response.text) as DeviceDesign;
  design.rawJson = response.text;

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));
    design.groundingSources = sources;
  }

  return design;
};

export const generateBatchTestReport = async (deviceName: string = "Generic Device") => {
  const ai = getAI();
  const prompt = `Perform a batch engineering validation sweep for the medical device: "${deviceName}". 
  Provide 5-6 diverse test scenarios including biocompatibility, mechanical stress, and regulatory edge cases. 
  Response must be JSON.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0,
      seed: 42,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          testCases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                input: { type: Type.STRING },
                decision: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARNING"] }
              },
              required: ["id", "name", "input", "decision", "status"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["testCases", "summary"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const validateDeviceInput = async (deviceName: string) => {
  const ai = getAI();
  const prompt = `STRICT MEDICAL INTEGRITY CHECK: Is "${deviceName}" a mechanical medical device used for surgery, therapy, or diagnostics? Response must be JSON.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0,
      seed: 42,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: { type: Type.BOOLEAN },
          reason: { type: Type.STRING }
        },
        required: ["isValid", "reason"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const getDeviceDefaults = async (deviceName: string) => {
  const ai = getAI();
  const prompt = `Senior Mechanical Engineer: Provide engineering defaults for: "${deviceName}". ARCHITECTURE, SIMULATION, and CLINICAL MATRIX.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0,
      seed: 42,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          architecture: { type: Type.STRING },
          simulation: { type: Type.STRING },
          clinicalMatrix: { type: Type.STRING }
        },
        required: ["architecture", "simulation", "clinicalMatrix"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateCadVisualization = async (design: DeviceDesign): Promise<string> => {
  const ai = getAI();
  
  // Sort materials to create a canonical string for the prompt
  const sortedMaterials = [...design.materials].sort((a, b) => a.component.localeCompare(b.component));
  const matInfo = sortedMaterials.map(m => `${m.component}: ${m.material}`).join(", ");
  
  // Stable Render Prompt construction
  const renderPrompt = `Professional 3D CAD render of medical device: ${design.deviceName}. 
  ARCHITECTURE: ${design.deviceType}. 
  ENGINEERING COMPONENTS: ${matInfo}. 
  STYLE: SolidWorks industrial blueprint aesthetic, isometric view, neutral studio lighting, clean white background, strictly no text or labels.`;
  
  // Create a seed based on the device name and type to ensure visual stability for same inputs
  const stableSeed = getStableSeed(`${design.deviceName}-${design.deviceType}`);

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: renderPrompt }] },
    config: { 
      seed: stableSeed, 
      temperature: 0,
      imageConfig: { aspectRatio: "16:9", imageSize: "1K" } 
    }
  });
  
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (!part) throw new Error("Image generation failed or returned no data.");
  return `data:image/png;base64,${part.inlineData.data}`;
};
