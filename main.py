
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types

app = FastAPI(title="MedMat 3D Pro Core API")

# Initialize Gemini Client
# process.env.API_KEY is handled via os.environ for Python
client = genai.Client(api_key=os.environ.get("API_KEY"))

# --- Data Models ---

class MaterialMatch(BaseModel):
    component: str
    material: str
    shore: str
    propertiesAlignment: str
    complianceFDA: str
    toxicityStudies: str
    availabilityNA: str
    suppliersCMOs: List[str]
    weldabilityAnalysis: str

class SDSSection(BaseModel):
    id: int
    heading: str
    content: str

class GHSClassification(BaseModel):
    category: str
    class_name: str  # 'class' is a reserved keyword in Python

class PrecautionaryStatements(BaseModel):
    prevention: List[str]
    response: List[str]
    storage: List[str]
    disposal: List[str]

class SDSData(BaseModel):
    productName: str
    casNumber: str
    otherIdentifiers: Optional[str] = None
    recommendedUse: Optional[str] = None
    supplierInfo: Optional[str] = None
    emergencyContacts: Optional[str] = None
    hazards: str
    classification: List[GHSClassification]
    precautionaryStatements: PrecautionaryStatements
    pictograms: List[str]
    signalWord: str
    sections: List[SDSSection]
    revisionDate: str
    validationHash: str

class SimulationMetric(BaseModel):
    label: str
    value: str
    unit: str
    description: str
    status: str # OPTIMAL, CRITICAL, WARNING

class SimulationData(BaseModel):
    metrics: List[SimulationMetric]
    engineeringSummary: str
    safetyFactor: float

class GeometricSpecs(BaseModel):
    od_mm: float
    tolerance: str
    wallThickness: float
    bellowsCount: int
    tendonChannelsCount: int
    labels: List[str]

class DeviceDesign(BaseModel):
    deviceName: str
    deviceType: str
    materials: List[MaterialMatch]
    specs: GeometricSpecs
    simulation: SimulationData
    sdsLibrary: List[SDSData]
    cadImageUrl: Optional[str] = None

# --- API Endpoints ---

@app.post("/validate")
async def validate_device(device_name: str):
    """STRICT MEDICAL INTEGRITY CHECK (Flash Model)"""
    prompt = f"STRICT MEDICAL INTEGRITY CHECK: Is '{device_name}' a mechanical medical device used for surgery, therapy, or diagnostics? Return JSON with bool 'isValid' and string 'reason'."
    
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema={
                "type": "OBJECT",
                "properties": {
                    "isValid": {"type": "BOOLEAN"},
                    "reason": {"type": "STRING"}
                },
                "required": ["isValid", "reason"]
            }
        )
    )
    return response.parsed

@app.get("/defaults")
async def get_defaults(device_name: str):
    """Fetch engineering defaults (Flash Model)"""
    prompt = f"Senior Mechanical Engineer: Provide engineering defaults for: '{device_name}'. ARCHITECTURE, SIMULATION, and CLINICAL MATRIX."
    
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema={
                "type": "OBJECT",
                "properties": {
                    "architecture": {"type": "STRING"},
                    "simulation": {"type": "STRING"},
                    "clinicalMatrix": {"type": "STRING"}
                },
                "required": ["architecture", "simulation", "clinicalMatrix"]
            }
        )
    )
    return response.parsed

@app.post("/generate", response_model=DeviceDesign)
async def generate_design(prompt: str):
    """Full Device Synthesis (Pro Model with RAG)"""
    system_instruction = """You are a Senior Medical Device Regulatory Engineer.
    TASK: Synthesize a professional technical design dossier.
    SDS GENERATION RULES: 1 SDS record per material. 16 sections following GHS standards."""

    try:
        response = client.models.generate_content(
            model="gemini-3-pro-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0,
                response_mime_type="application/json",
                tools=[{"google_search": {}}],
                thinking_config={"thinking_budget": 32768}
            )
        )
        # In a real environment, we'd parse this into the Pydantic model
        return response.parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/render")
async def render_cad(design: DeviceDesign):
    """Generate Image Render (Pro Image Model)"""
    mat_info = ", ".join([f"{m.component}: {m.material}" for m in design.materials])
    render_prompt = f"Professional 3D CAD render of medical device: {design.deviceName}. Style: SolidWorks industrial blueprint, isometric, neutral lighting, white background."
    
    response = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=render_prompt,
        config=types.GenerateContentConfig(
            image_config={"aspect_ratio": "16:9", "image_size": "1K"}
        )
    )
    
    for part in response.candidates[0].content.parts:
        if part.inline_data:
            return {"image_data": f"data:image/png;base64,{part.inline_data.data}"}
            
    raise HTTPException(status_code=500, detail="Image generation failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
