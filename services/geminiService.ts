import { GoogleGenAI, Modality } from "@google/genai";
// Fix: Corrected the type import from GenerateVideosOperationResponse to GenerateVideosOperation.
import type { GenerateVideosOperation } from '@google/genai';
import { AspectRatio } from "../types";

const POLLING_INTERVAL_MS = 10000;

// This function simulates a delay, useful for polling.
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API key no está configurada. Por favor, asegúrate de que process.env.API_KEY esté disponible.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const editImage = async (
    imageBase64: string,
    mimeType: string,
    prompt: string,
): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    throw new Error("El modelo no devolvió una imagen editada.");
}

export const generateVideoFromImage = async (
  imageBase64: string,
  mimeType: string,
  prompt: string,
  aspectRatio: AspectRatio,
  updateStatus: (message: string) => void
): Promise<string> => {
  const ai = getAiClient();

  updateStatus("Iniciando la generación de video...");
  // Fix: Corrected the type annotation for the operation variable.
  let operation: GenerateVideosOperation = await ai.models.generateVideos({
    model: 'veo-2.0-generate-001',
    prompt: prompt,
    image: {
      imageBytes: imageBase64,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      aspectRatio: aspectRatio,
    }
  });

  updateStatus("Procesando tu video... Esto puede tardar varios minutos.");
  let pollCount = 0;
  
  const reassuringMessages = [
    "Analizando los detalles de tu imagen...",
    "Despertando a los duendes de la IA...",
    "Componiendo la sinfonía visual...",
    "Renderizando píxeles mágicos...",
    "Casi listo, puliendo los últimos detalles..."
  ];

  while (!operation.done) {
    await delay(POLLING_INTERVAL_MS);
    const messageIndex = pollCount % reassuringMessages.length;
    updateStatus(`Procesando... ${reassuringMessages[messageIndex]}`);
    try {
      operation = await ai.operations.getVideosOperation({ operation: operation });
    } catch(e) {
        console.error("Error during polling", e);
        throw new Error("Se perdió la conexión durante el procesamiento del video. Por favor, inténtalo de nuevo.");
    }
    pollCount++;
  }

  if (operation.error) {
    throw new Error(`Error en la operación de video: ${operation.error.message}`);
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("No se pudo obtener el enlace de descarga del video generado.");
  }
  
  updateStatus("Descargando video generado...");

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) {
    throw new Error(`Error al descargar el video: ${response.statusText}`);
  }

  const videoBlob = await response.blob();
  const videoUrl = URL.createObjectURL(videoBlob);
  
  updateStatus("¡Video listo!");
  
  return videoUrl;
};
