import { GoogleGenAI, Type } from "@google/genai";
import { Order } from "../types";

// Initialize Gemini
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing VITE_GEMINI_API_KEY in .env.local");
}
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Parses an image or PDF file to extract order data using Gemini.
 */
export const parseOrderDocument = async (base64Data: string, mimeType: string): Promise<Partial<Order>[]> => {
  try {
    // Updated to use the correct model for multimodal tasks as per instructions
    const model = "gemini-2.0-flash";

    const prompt = `
      Analiza este documento (imagen de Excel, PDF o foto de pantalla).
      Extrae los datos de las filas para llenar una tabla de envíos con las siguientes columnas exactas:

      1. Nombre del Cliente (NOMBRE)
      2. Ciudad (CIUDAD/DESTINO)
      3. Teléfono (TELEFONO)
      4. Productos (DESCRIPCION/CONTENIDO)
      5. Precio Total (TOTAL/MONTO/VALOR - Solo números, ej: 1950)

      Atención:
      - El campo 'Precio Total' es CRUCIAL. Busca valores como "$1,950", "2200", etc. y conviértelos a número puro.
      - Si hay múltiples filas, extráelas todas.
      - Devuelve un array JSON.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              customerName: { type: Type.STRING },
              shippingNumber: { type: Type.STRING },
              shippingCompany: { type: Type.STRING },
              date: { type: Type.STRING },
              city: { type: Type.STRING },
              total: { type: Type.NUMBER },
              productSummary: { type: Type.STRING },
              phoneNumber: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      const textResponse = response.text.trim();
      // Handle potential markdown code blocks if the model includes them despite mimeType config
      const jsonString = textResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      const parsed = JSON.parse(jsonString);

      // Transform raw parsing to partial Order objects
      return parsed.map((item: any) => ({
        customerName: item.customerName || "Desconocido",
        shippingNumber: item.shippingNumber || "",
        shippingCompany: item.shippingCompany || "General",
        date: item.date || new Date().toISOString().split('T')[0],
        city: item.city || "",
        total: item.total || 0,
        productSummary: item.productSummary || "",
        phoneNumber: item.phoneNumber || "",
        // Create a dummy item so the system works, but we rely on productSummary for display
        items: [{
          productId: "gen-id",
          productName: item.productSummary || "Item Importado",
          quantity: 1,
          unitPrice: item.total || 0
        }]
      }));
    }

    return [];

  } catch (error) {
    console.error("Error parsing document with Gemini:", error);
    throw new Error("No se pudo procesar el archivo. Asegúrate de que la imagen o PDF sea legible.");
  }
};

/**
 * Uses Gemini with Google Maps Grounding to convert a Plus Code to an address.
 * Requires Gemini 2.5 Flash model.
 */
export const resolvePlusCodeToAddress = async (plusCode: string): Promise<string | null> => {
  try {
    // Maps grounding is only supported in Gemini 2.5 series models.
    const model = "gemini-2.5-flash";

    const prompt = `
      El usuario ha proporcionado este Código Plus de Google Maps: "${plusCode}".
      
      Por favor, utiliza la herramienta de Google Maps para encontrar la ubicación exacta.
      Devuélveme SOLAMENTE la dirección física completa (Calle, Número, Sector, Ciudad) correspondiente a ese código.
      No agregues explicaciones, solo la dirección.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        // responseMimeType and responseSchema are NOT allowed with googleMaps
      },
    });

    // Extract text directly
    let address = response.text || "";

    // Maps grounding provides specific chunks, we can double check if needed, 
    // but the model is instructed to return the address in text.
    // If we wanted the map link, we would check response.candidates?.[0]?.groundingMetadata?.groundingChunks

    return address.trim();

  } catch (error) {
    console.error("Error resolving Plus Code:", error);
    return null;
  }
};