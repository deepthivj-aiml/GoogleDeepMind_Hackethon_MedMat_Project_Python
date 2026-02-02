
import { DeviceDesign } from "../types";

// Note: In this simulation, we assume the Python backend is running at :8000
// For this environment, we will mock the fetch calls to point to the logic
// that would be in the Python main.py.

const API_BASE = "http://localhost:8000";

export const validateDeviceInput = async (deviceName: string) => {
  const response = await fetch(`${API_BASE}/validate?device_name=${encodeURIComponent(deviceName)}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error("Backend validation failed");
  return await response.json();
};

export const getDeviceDefaults = async (deviceName: string) => {
  const response = await fetch(`${API_BASE}/defaults?device_name=${encodeURIComponent(deviceName)}`);
  if (!response.ok) throw new Error("Backend defaults failed");
  return await response.json();
};

export const generateDesign = async (prompt: string): Promise<DeviceDesign> => {
  const response = await fetch(`${API_BASE}/generate?prompt=${encodeURIComponent(prompt)}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error("Synthesis failure");
  return await response.json();
};

export const generateCadVisualization = async (design: DeviceDesign): Promise<string> => {
  const response = await fetch(`${API_BASE}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(design)
  });
  if (!response.ok) throw new Error("CAD rendering failed");
  const data = await response.json();
  return data.image_data;
};
