<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Kw1-gz_Iv7M6GGY2KBNqO89KAeNKwx9-

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`



   MedMat 3D Pro: Clinical Engineering Synthesized
MedMat 3D Pro is a high-fidelity, AI-driven workspace for mechanical medical hardware design. It leverages the multi-modal reasoning capabilities of the Google Gemini 3.0 series to bridge the gap between clinical intent and regulatory-ready manufacturing documentation.
🏗 System Architecture
The application is built as a modular Single Page Application (SPA) prioritizing deterministic outputs for life-critical engineering.
1. The Intelligence Tier (Google Gemini 3.0)
The platform utilizes an orchestrated multi-model approach to balance speed, complexity, and visual fidelity:
Gemini 3 Pro Preview: Handles high-complexity technical synthesis, generating structured JSON for Bill of Materials (BOM) and GHS-compliant Safety Data Sheets (SDS).
Gemini 3 Flash Preview: Operates the "Integrity Sandbox," performing real-time clinical validation and fetching engineering defaults.
Gemini 3 Pro Image Preview: Generates deterministic, seed-based 3D CAD renders using PBR (Physically Based Rendering) prompts.
2. The Visualization Tier (Three.js & WebGL)
A procedural 3D engine that converts numerical AI outputs into interactive "Digital Twins":
Procedural Geometry: Dynamic meshes for Catheters, Stents, and Bone Plates generated in-browser.
Material Mapping: Real-time visual annotation linking 3D components to the synthesized BOM.
X-Ray Mode: Transparent rendering to visualize internal lumens and tendon channels.
3. The Data Tier (RAG Validation)
To eliminate AI hallucinations in clinical contexts, the system employs Retrieval-Augmented Generation (RAG):
Google Search Grounding: Every material selection is verified against live FDA, ISO, and global supplier databases.
Source Verification: Provides an audit trail of URLs used to justify biocompatibility and toxicity status.
🚀 Key Features
Clinical Synthesis Engine: Type a device name, and the system generates a full mechanical architecture, simulation targets, and material matrix.
Regulatory Export Suite:
Technical Dossier: Comprehensive engineering rationale and specs (ISO 13485 ready).
SDS Bundle: 16-section GHS-compliant safety sheets for all components.
Executive Summary: High-level performance snapshot for clinical stakeholders.
Interactive Bio-Core: A 3D hero lattice utilizing mouse-tracking physics to symbolize the intersection of biology and engineering.
Telemetry HUD: Real-time monitoring of Outer Diameter (OD), Wall Thickness, and Safety Factors.
🛠 Tech Stack
Layer	Technology
Framework	React 19 (Modern ESM)
AI SDK	@google/genai
3D Engine	Three.js (WebGL)
Styling	Tailwind CSS
Icons/UI	Custom Clinical Design System
Grounding	Google Search Tool integration
📋 Regulatory Compliance & Use Cases
This application is designed to support the following professional workflows:
FDA 510(k) / MDR 2017/745 Submissions: Rapid generation of technical files for pre-clinical documentation.
ISO 10993 Screening: Automated verification of material biocompatibility for blood and tissue contact.
Manufacturing EHS: Automated authoring of safety data for hazardous material handling.
🔧 Getting Started
Prerequisites
A valid Google Gemini API Key (Injected via environment variables).
Browser with WebGL 2.0 support.
Installation
Clone the repository.
Ensure your process.env.API_KEY is configured.
Open index.html via a local development server (e.g., Vite or Live Server).
📄 License & Disclaimer
License: MIT
Medical Disclaimer: MedMat 3D Pro is an engineering assistant tool. All AI-generated outputs MUST be reviewed and signed off by a certified Professional Engineer (PE) or Regulatory Affairs specialist before manufacturing or clinical use.
