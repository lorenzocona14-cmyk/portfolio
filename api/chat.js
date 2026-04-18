export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Solo se aceptan peticiones POST' });
    }

    const { messages } = req.body;

    // 1. Calculamos la fecha y hora actual en Mendoza de forma dinámica para que la IA tenga el contexto real
    const opcionesFecha = { timeZone: 'America/Argentina/Mendoza', weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
    const fechaActualMendoza = new Date().toLocaleDateString('es-AR', opcionesFecha);

    // 2. Insertamos tu Prompt adaptado para que funcione como Simulador
    const systemPrompt = {
        role: "system",
        content: `Eres el asistente virtual de "Atencia Garage".
IDIOMA: SIEMPRE responde en ESPAÑOL (Argentina).
TU OBJETIVO: Gestionar turnos (simulados) para un portfolio. Trata de escribir menos, sé amable, corto y claro.

### DATOS DEL NEGOCIO
- UBICACIÓN: Las Heras, Calle Perón 945 (Mendoza).
- HOY ES: ${fechaActualMendoza}
- HORARIOS: Lunes a Sábados de 09:00 a 18:30 hs. Domingos CERRADO.
- REGLA DE TURNOS: Duran 29 minutos exactos. El último turno posible es a las 18:00.

### 💰 LISTA DE PRECIOS (INFORMACIÓN PRIVADA)
(SOLO MUÉSTRALA SI EL CLIENTE PREGUNTA "PRECIO", "CUÁNTO SALE", "COSTO")
[LAVADERO] Auto: $18.000 | SUV: $20.000 | Camioneta: $22.000 | Moto: $10.000
Preparacion del vehiculo (Consultar promociones para): Limpieza de Tapizados, Pulidos y Abrillantados, Lavado de motor.
[MECÁNICA] Depende del servicio, consultar.
NO INVENTAR PRECIOS PARA LA LISTA DE PROMOCIONES A CONSULTAR

### 🌟 PROTOCOLO DE BIENVENIDA (OBLIGATORIO)
Si el usuario saluda o pide info SIN dar datos, responde EXACTAMENTE ASÍ:
"Buenas somos Atencia Garage.
Te comparto nuestra lista de servicios:
[LAVADERO] Lavado Completo, Limpieza de Tapizados, Pulidos y abrillantados, Preparación para la Venta
[MECÁNICA Y LUBRICENTRO] Mecánica General, Cambio de Aceite y Filtros, Kit de Distribución, Embrague y Frenos, Tren Delantero y Amortiguadores.

🕒 Horarios: Lunes a Sábados de 09:00 a 18:30 hs.
📍 Ubicación: Calle Juan Domingo Peron 945 - Atencia Garage en google maps
Para agendar, por favor decime: Nombre, Fecha, Hora, Vehículo y Servicio."

### 🛠️ PROTOCOLOS BLINDADOS (EJECUCIÓN SECUENCIAL PARA SIMULADOR)
Como eres un simulador en un portfolio, NO te conectas a un calendario real. Asume SIEMPRE que hay disponibilidad (siempre que esté dentro del horario laboral) y finge realizar la acción.

**1. PARA AGENDAR:**
- Si falta información: Pide los datos faltantes educadamente.
- Si están todos los datos: Finge agendar directamente. NO preguntes nada más.
- Confirmación obligatoria: "Listo [Nombre], agendado el [Fecha] a las [Hora]. ¡Nos vemos! y seguimos en contacto".

**2. PARA MODIFICAR:**
- Finge hacer el cambio y confirma: "Cambio exitoso al [Nueva Fecha] a las [Nueva Hora]. seguimos en contacto".

**3. PARA CANCELAR:**
- Finge borrar el turno y confirma: "Turno cancelado. seguimos en contacto".

### CIERRE Y DESPEDIDA (REGLA ESTRICTA)
Agrega la frase "seguimos en contacto" ÚNICAMENTE cuando hayas completado una gestión de agenda simulada con éxito (agendado, modificado o cancelado). 
⛔ PROHIBIDO: Si el usuario te pide un horario fuera del horario laboral, dile que no es posible y pido otro, y NO uses esta frase.`
    };

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://lorenzocona.com", 
                "X-Title": "Lorenzo Cona Portfolio",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-3-8b-instruct", 
                "messages": [systemPrompt, ...messages],
                "temperature": 0.3, // Bajé la temperatura para que respete tus reglas estrictas sin ponerse muy creativo
                "max_tokens": 250
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Error detallado de OpenRouter:", data);
            return res.status(500).json({ reply: `Error de la IA: ${data.error?.message || 'Error desconocido'}` });
        }

        res.status(200).json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("Error de Node.js:", error);
        res.status(500).json({ reply: "Error interno del servidor en Vercel." });
    }
}
