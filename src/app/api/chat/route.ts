import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllProducts } from "@/lib/firestore";

// Initialize Gemini SDK
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "La API Key de Gemini o Firebase no está configurada en .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { messages } = body; // Array of { role: "user"|"model", parts: string } or { role: "user"|"model", content: string }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Mensajes inválidos" }, { status: 400 });
    }

    // Load actual catalog products from Firestore
    const catalog = await getAllProducts();

    // System prompt introducing Luteame chatbot persona, compatibility rules and the live catalog
    const systemPrompt = `
Eres "Luteame AI", el asesor virtual experto en armado de PC y hardware de Luteame, una marca premium local ubicada en Huancayo, Junín (Perú).
Tu objetivo es guiar a los clientes para armar la PC de sus sueños con asesoría honesta, técnica y optimizada para su presupuesto.

REGLAS DE COMPORTAMIENTO:
1. Sé amable, entusiasta y con tono "gamer" pero profesional. Usa términos peruanos sutilmente si es oportuno, y menciona que la garantía y el armado son locales en Huancayo.
2. Si te preguntan por armados de PC, SIEMPRE recomienda productos del catálogo real que te proporcionamos a continuación.
3. Evalúa la compatibilidad basándote en las especificaciones del catálogo:
   - Sockets: El CPU y la Placa Madre deben tener el mismo socket (ej. AM5 con AM5, LGA1700 con LGA1700).
   - Memoria RAM: El tipo de RAM (DDR4 o DDR5) debe coincidir con el soporte de la placa madre.
   - Fuente de Poder (PSU): La suma de TDP del CPU y GPU más 150W base debe ser menor que la potencia de la fuente (PSU). Recomienda un 20% de holgura.
   - Gabinete: Placas grandes (E-ATX o ATX) requieren gabinetes grandes, no caben en ITX.
4. Responde con Markdown limpio.
5. **CRÍTICO - RECOMENDACIÓN DE PRODUCTOS:**
   Cuando recomiendes uno o varios productos específicos del catálogo, al final de tu respuesta debes incluir EXACTAMENTE un bloque de código JSON con los IDs de los productos recomendados. Esto le permitirá a la interfaz mostrar tarjetas interactivas de compra.
   El bloque JSON debe tener esta estructura exacta, justo al final del mensaje (después de todo el texto):
   \`\`\`json
   {
     "recomendaciones": ["ID_DEL_PRODUCTO_1", "ID_DEL_PRODUCTO_2"]
   }
   \`\`\`
   Asegúrate de que los IDs coincidan exactamente con el "id" del producto del catálogo proporcionado abajo. No inventes IDs.

CATÁLOGO EN TIEMPO REAL DISPONIBLE EN LUTEAME:
${JSON.stringify(
  catalog.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    precio: `S/. ${p.precio}`,
    stock: p.stock,
    especificaciones: p.especificaciones,
  })),
  null,
  2
)}

Conversa con el usuario resolviendo sus dudas y recomendando el hardware adecuado.
`;

    // Map messages history to Gemini parts format
    // Gemini 1.5 format expects model role to be 'model' instead of 'assistant'
    const contents = messages.map((m: any) => {
      const role = m.role === "assistant" || m.role === "model" ? "model" : "user";
      return {
        role,
        parts: [{ text: m.content || m.text || "" }],
      };
    });

    // We can inject the system instruction directly into the model configuration
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent({
      contents,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
  } catch (err: any) {
    console.error("Gemini API Route Error:", err);
    return NextResponse.json(
      { error: "Error interno al procesar el chat con Gemini: " + err.message },
      { status: 500 }
    );
  }
}
