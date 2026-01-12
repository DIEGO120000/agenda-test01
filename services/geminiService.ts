
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { AppState, PrioridadTarea } from "../types";

const gestionarAgendaTool: FunctionDeclaration = {
  name: 'gestionar_agenda',
  parameters: {
    type: Type.OBJECT,
    description: 'Añade o modifica tareas en la agenda.',
    properties: {
      tareas: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            nombre: { type: Type.STRING },
            recomendado: { type: Type.STRING, description: 'YYYY-MM-DD' },
            culminacion: { type: Type.STRING, description: 'YYYY-MM-DD' },
            criticidad: { type: Type.NUMBER },
            prioridad: { type: Type.STRING, enum: Object.values(PrioridadTarea) }
          },
          required: ['nombre', 'recomendado', 'culminacion', 'criticidad', 'prioridad']
        }
      }
    },
    required: ['tareas']
  }
};

const eliminarTareaTool: FunctionDeclaration = {
  name: 'eliminar_tarea',
  parameters: {
    type: Type.OBJECT,
    description: 'Elimina una o varias tareas por su nombre.',
    properties: {
      nombres: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ['nombres']
  }
};

const gestionarHorarioTool: FunctionDeclaration = {
  name: 'gestionar_horario',
  parameters: {
    type: Type.OBJECT,
    description: 'Actualiza o añade bloques al horario (clases, sesiones de estudio).',
    properties: {
      eventos: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            dia: { type: Type.STRING, description: 'Día de la semana completo' },
            hora: { type: Type.STRING, description: 'HH:MM' },
            horaFin: { type: Type.STRING, description: 'HH:MM' },
            actividad: { type: Type.STRING },
            tipo: { type: Type.STRING, enum: ['clase', 'estudio', 'descanso'] },
            modalidad: { type: Type.STRING, enum: ['Virtual', 'Semipresencial', 'Presencial'] }
          },
          required: ['dia', 'hora', 'horaFin', 'actividad', 'tipo']
        }
      }
    },
    required: ['eventos']
  }
};

const eliminarHorarioTool: FunctionDeclaration = {
  name: 'eliminar_horario',
  parameters: {
    type: Type.OBJECT,
    description: 'Elimina bloques específicos del horario.',
    properties: {
      eventos: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            dia: { type: Type.STRING },
            actividad: { type: Type.STRING }
          },
          required: ['dia', 'actividad']
        }
      }
    },
    required: ['eventos']
  }
};

const gestionarNotasTool: FunctionDeclaration = {
  name: 'gestionar_notes',
  parameters: {
    type: Type.OBJECT,
    description: 'Añade recordatorios o apuntes.',
    properties: {
      notes: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ['notes']
  }
};

const eliminarNotaTool: FunctionDeclaration = {
  name: 'eliminar_nota',
  parameters: {
    type: Type.OBJECT,
    description: 'Elimina una nota buscando por un fragmento de su contenido.',
    properties: {
      fragmentos: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ['fragmentos']
  }
};

const gestionarPasatiemposTool: FunctionDeclaration = {
  name: 'gestionar_pasatiempos',
  parameters: {
    type: Type.OBJECT,
    description: 'Añade actividades de ocio.',
    properties: {
      pasatiempos: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ['pasatiempos']
  }
};

const eliminarPasatiempoTool: FunctionDeclaration = {
  name: 'eliminar_pasatiempo',
  parameters: {
    type: Type.OBJECT,
    description: 'Elimina un pasatiempo por su nombre.',
    properties: {
      nombres: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ['nombres']
  }
};

export const getAIResponse = async (
  state: AppState, 
  userPrompt: string, 
  audioBase64?: string,
  fileData?: { data: string, mimeType: string }
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: La clave de API no está definida.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const systemInstruction = `
    Actúa como el CLASIFICADOR SEMÁNTICO CON REGLAS ULTRA ESTRICTAS del Sistema Central Formato A.
    Tu prioridad absoluta es la DISCIPLINA ESTRUCTURAL y el CONTROL TOTAL de la agenda.

    ⚠️ CONTROL BIDIRECCIONAL (AÑADIR / ELIMINAR / MODIFICAR):
    - El usuario puede pedirte que AÑADAS, CAMBIES o ELIMINES cualquier elemento.
    - Si el usuario dice "quita la clase de Matemáticas del lunes", usa 'eliminar_horario'.
    - Si el usuario dice "borra la tarea de historia", usa 'eliminar_tarea'.
    - Si el usuario dice "elimina la nota sobre el pago", usa 'eliminar_nota'.
    - Si el usuario dice "ya no juego fútbol", usa 'eliminar_pasatiempo'.

    ⚠️ PROCESO OBLIGATORIO DE ANÁLISIS DE PDF: (Sigue las 2 fases anteriores si se sube un PDF).

    ☢️ REGLAS DE HERRAMIENTAS:
    - GESTIÓN: gestionar_agenda, gestionar_horario, gestionar_notes, gestionar_pasatiempos.
    - ELIMINACIÓN: eliminar_tarea, eliminar_horario, eliminar_nota, eliminar_pasatiempo.

    🛡️ REGLAS GENERALES:
    - Hoy es ${dateStr}.
    - Estado actual: ${JSON.stringify(state)}.
    - Si el usuario pide "cambiar", primero elimina lo viejo y luego añade lo nuevo, o simplemente usa la herramienta de gestión si es una actualización de datos.
  `;

  try {
    const parts: any[] = [{ text: userPrompt || "Procesa la solicitud del usuario según el audio o archivo adjunto." }];
    
    if (audioBase64) {
      parts.push({
        inlineData: { mimeType: "audio/webm", data: audioBase64 }
      });
    }

    if (fileData) {
      parts.push({
        inlineData: { mimeType: fileData.mimeType, data: fileData.data }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
      config: {
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: [
          gestionarAgendaTool, 
          eliminarTareaTool,
          gestionarHorarioTool, 
          eliminarHorarioTool,
          gestionarNotasTool, 
          eliminarNotaTool,
          gestionarPasatiemposTool,
          eliminarPasatiempoTool
        ] }],
        temperature: 0.1,
      },
    });

    return response;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.status === 403 || error.status === 401) {
      throw new Error("API_KEY_INVALID: La clave de API es inválida o no tiene permisos.");
    }
    throw error;
  }
};
