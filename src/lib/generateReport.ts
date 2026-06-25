export async function generateAIReport(data: {
  contextType: string;
  duration: number;
  fillerWords: number;
  eyeContact: number;
  posture: number;
  voiceTone: number;
  gestures: number;
  transcript: string;
  scriptText?: string; // texto que el usuario PLANEÓ decir (opcional)
}): Promise<string> {

  const contextNames: Record<string, string> = {
    thesis: "defensa de tesis",
    sales: "presentación de ventas",
    "work-presentation": "presentación laboral",
    "public-speaking": "hablar en público",
    "class-presentation": "exposición en clase",
    interview: "entrevista de trabajo",
  };

  // Si el usuario subió un guion, pedimos a la IA que lo compare con lo dicho
  const script = (data.scriptText || "").trim();
  const scriptSection = script
    ? `

Guion que el usuario PLANEÓ decir (lo que subió antes de empezar):
"${script.slice(0, 800)}"

Compara este guion con la transcripción real: ¿cubrió las ideas principales?
¿se desvió, improvisó u omitió partes importantes? Inclúyelo en el análisis.`
    : "";

  const prompt = `
Eres un coach experto en comunicación y oratoria.
El usuario acaba de completar una sesión de práctica para: ${contextNames[data.contextType] || data.contextType}.

Métricas de la sesión:
- Duración: ${Math.floor(data.duration / 60)} minutos ${data.duration % 60} segundos
- Muletillas detectadas: ${data.fillerWords}
- Contacto visual: ${data.eyeContact}%
- Postura corporal: ${data.posture}/100
- Tono de voz: ${data.voiceTone}/100
- Gestos con manos: ${data.gestures}/100

Fragmento de transcripción (lo que REALMENTE dijo):
"${data.transcript.slice(0, 500)}"${scriptSection}

Genera un reporte detallado en español con:
1. **Resumen ejecutivo** (2-3 oraciones motivadoras)
2. **Top 3 fortalezas** detectadas en esta sesión
3. **Top 3 áreas de mejora** con recomendaciones concretas y un ejercicio específico para cada una
${script ? "4. **Guion vs. realidad** (qué tan fiel fue al texto que planeó decir)\n5" : "4"}. **Plan para la próxima sesión** (qué practicar y cómo)

Sé específico, empático y motivador.
`;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la API key de Gemini (VITE_GEMINI_API_KEY).");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Gemini respondió ${response.status}. ${detail.slice(0, 200)}`
    );
  }

  const result = await response.json();

  // Validar la forma de la respuesta antes de leerla (puede venir bloqueada,
  // vacía o con un error en vez de candidates).
  const text =
    result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof text !== "string" || !text.trim()) {
    const blockReason =
      result?.promptFeedback?.blockReason ||
      result?.candidates?.[0]?.finishReason;
    throw new Error(
      blockReason
        ? `Gemini no devolvió texto (motivo: ${blockReason}).`
        : "Gemini devolvió una respuesta vacía o con formato inesperado."
    );
  }

  return text;
}