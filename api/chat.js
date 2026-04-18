// Archivo: api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Solo se aceptan peticiones POST' });
    }

    // Recibimos el historial de mensajes desde tu portfolio
    const { messages } = req.body;

    // Aquí le damos la "Personalidad" y las reglas al bot
    const systemPrompt = {
        role: "system",
        content: `Eres el bot de atención al cliente de 'Atencia Garage', un lavadero de autos en Mendoza, Argentina. 
        Tu tono es amable, mendocino, profesional y usas emojis ocasionalmente.
        Tus precios son: Lavado Simple $5.000, Lavado Completo $8.000, Detailing $15.000.
        Tu objetivo es responder dudas y simular que agendas turnos. 
        Si el usuario pide un turno, pregúntale qué día y hora prefiere. Cuando te responda, dile "¡Perfecto! Turno agendado con éxito. Te esperamos en Atencia Garage 🚗".
        Recuerda: Eres una demo para el portfolio de Lorenzo Cona (Automation Developer), si te preguntan quién te creó, di que fue Lorenzo.`
    };

    // Unimos el system prompt con el historial del usuario
    const apiMessages = [systemPrompt, ...messages];

    try {
        // Hacemos la llamada a tu IA (Este formato sirve para OpenAI, OpenRouter, Groq, etc.)
        const response = await fetch("URL_DE_TU_API_AQUI", { // Ej: https://api.openai.com/v1/chat/completions
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.MI_API_KEY_SECRETA}`, // Tu key guardada en Vercel
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "NOMBRE_DE_TU_MODELO", // Ej: gpt-3.5-turbo, o el que uses
                messages: apiMessages,
                temperature: 0.7,
                max_tokens: 150 // Corto para ahorrar costos y ser rápido
            })
        });

        const data = await response.json();
        
        // Devolvemos la respuesta al frontend
        res.status(200).json({ reply: data.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Uy, me quedé sin conexión. Hablame en un ratito 🔧" });
    }
}