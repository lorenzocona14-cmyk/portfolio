export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Solo se aceptan peticiones POST' });
    }

    const { messages } = req.body;

    // Configuración de la IA para tu portfolio
    const systemPrompt = {
        role: "system",
        content: `Eres el bot de atención al cliente de 'Atencia Garage', un lavadero de autos en Mendoza, Argentina. 
        Tu tono es amable, mendocino, profesional y usas emojis ocasionalmente.
        Tus precios son: Lavado Simple $5.000, Lavado Completo $8.000, Detailing $15.000.
        Tu objetivo es responder dudas y simular que agendas turnos.`
    };

    try {
        // AQUÍ ESTABA EL ERROR: Ya puse la URL real de OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://lorenzocona.com", 
                "X-Title": "Lorenzo Cona Portfolio",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Modelo open source gratuito y rápido en OpenRouter
                "model": "meta-llama/llama-3-8b-instruct", 
                "messages": [systemPrompt, ...messages],
                "temperature": 0.7
            })
        });

        const data = await response.json();

        // Si OpenRouter devuelve algún error de autenticación o saldo
        if (!response.ok) {
            console.error("Error detallado de OpenRouter:", data);
            return res.status(500).json({ reply: `Error de la IA: ${data.error?.message || 'Error desconocido'}` });
        }

        // Si todo sale bien, devolvemos el mensaje al HTML
        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("Error de Node.js:", error);
        res.status(500).json({ reply: "Error interno del servidor en Vercel." });
    }
}
