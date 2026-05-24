export async function generateAIReport(data: {
  contextType: string;
  duration: number;
  fillerWords: number;
  eyeContact: number;
  posture: number;
  voiceTone: number;
  gestures: number;
  transcript: string;
}): Promise<string> {

  const contextNames: Record<string, string> = {
    thesis: "defensa de tesis",
    sales: "presentación de ventas",
    "work-presentation": "presentación laboral",
    "public-speaking": "hablar en público",
    "class-presentation": "exposición en clase",
    interview: "entrevista de trabajo",
  };

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

Fragmento de transcripción:
"${data.transcript.slice(0, 500)}"

Genera un reporte detallado en español con:
1. **Resumen ejecutivo** (2-3 oraciones motivadoras)
2. **Top 3 fortalezas** detectadas en esta sesión
3. **Top 3 áreas de mejora** con recomendaciones concretas y un ejercicio específico para cada una
4. **Plan para la próxima sesión** (qué practicar y cómo)

Sé específico, empático y motivador.
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const result = await response.json();
  return result.candidates[0].content.parts[0].text;
}