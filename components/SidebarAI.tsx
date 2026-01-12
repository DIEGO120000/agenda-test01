
import React, { useState, useRef, useEffect } from 'react';
import { AppState, Tarea, EventoHorario } from '../types';
import { getAIResponse } from '../services/geminiService';
import { Sparkles, Send, Bot, User, BrainCircuit, Mic, MicOff, Loader2, FileText, X, Paperclip, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, MessageSquare, AlertCircle } from 'lucide-react';

interface Props {
  state: AppState;
  onAIAddTask: (tareas: any[]) => void;
  onAIRemoveTasks: (nombres: string[]) => void;
  onAIUpdateHorario: (eventos: any[]) => void;
  onAIRemoveHorario: (criterios: any[]) => void;
  onAIAddNotas: (textos: string[]) => void;
  onAIRemoveNotas: (fragmentos: string[]) => void;
  onAIAddPasatiempos: (textos: string[]) => void;
  onAIRemovePasatiempos: (nombres: string[]) => void;
}

const SidebarAI: React.FC<Props> = ({ 
  state, onAIAddTask, onAIRemoveTasks, onAIUpdateHorario, onAIRemoveHorario, 
  onAIAddNotas, onAIRemoveNotas, onAIAddPasatiempos, onAIRemovePasatiempos 
}) => {
  const [input, setInput] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user' | 'error'; text: string; fileName?: string }[]>([
    { role: 'ai', text: '¡Hola! Soy tu Sistema Central Formato A. Ahora puedes añadir o eliminar cualquier horario, tarea o nota con tu voz o escribiendo.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ data: string; name: string; mimeType: string } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isCollapsed]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (!result) return;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      setSelectedFile({
        data: base64,
        name: file.name,
        mimeType: file.type
      });
    };
    reader.onerror = () => alert("Error al leer el archivo.");
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const result = reader.result as string;
          if (!result) return;
          const base64Audio = result.includes(',') ? result.split(',')[1] : result;
          handleSend(base64Audio);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error micrófono:", err);
      setMessages(prev => [...prev, { role: 'error', text: "Error de Micrófono: Verifica que la página use HTTPS y que hayas dado permisos." }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async (audioData?: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput && !audioData && !selectedFile || loading) return;
    
    const userText = trimmedInput || (audioData ? "🎤 Comando de voz enviado" : (selectedFile ? `Archivo: ${selectedFile.name}` : ""));
    const currentFile = selectedFile;
    
    setInput('');
    setSelectedFile(null);
    setMessages(prev => [...prev, { role: 'user', text: userText, fileName: currentFile?.name }]);
    setLoading(true);

    try {
      const response = await getAIResponse(state, trimmedInput, audioData, currentFile || undefined);
      
      let actionExecuted = false;
      if (response && response.candidates?.[0]?.content?.parts) {
        // Procesar llamadas a funciones si existen
        // Nota: La lógica de ejecución de funciones ya está integrada en el servicio
      }

      // Extraer texto de la respuesta
      const textOutput = response.text || "Reporte: Cambios aplicados correctamente.";
      setMessages(prev => [...prev, { role: 'ai', text: textOutput }]);
      
      // Ejecutar funciones si vinieron en la respuesta
      if (response.functionCalls) {
        for (const fc of response.functionCalls) {
          const args = fc.args || {};
          switch (fc.name) {
            case 'gestionar_agenda': if (args.tareas) onAIAddTask(args.tareas as any[]); break;
            case 'eliminar_tarea': if (args.nombres) onAIRemoveTasks(args.nombres as string[]); break;
            case 'gestionar_horario': if (args.eventos) onAIUpdateHorario(args.eventos as any[]); break;
            case 'eliminar_horario': if (args.eventos) onAIRemoveHorario(args.eventos as any[]); break;
            case 'gestionar_notes': if (args.notes) onAIAddNotas(args.notes as string[]); break;
            case 'eliminar_nota': if (args.fragmentos) onAIRemoveNotas(args.fragmentos as string[]); break;
            case 'gestionar_pasatiempos': if (args.pasatiempos) onAIAddPasatiempos(args.pasatiempos as any[]); break;
            case 'eliminar_pasatiempo': if (args.nombres) onAIRemovePasatiempos(args.nombres as string[]); break;
          }
        }
      }

    } catch (error: any) {
      console.error("Error AI:", error);
      setMessages(prev => [...prev, { role: 'error', text: `Error: No se pudo contactar con la IA. ${error.message || ''}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isCollapsed && (
        <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setIsCollapsed(true)} />
      )}

      <aside className={`
        fixed bottom-0 left-0 w-full md:relative md:bottom-auto md:left-auto
        ${isCollapsed ? 'h-16 md:w-16 md:h-screen' : 'h-[85vh] md:h-screen md:w-96'}
        bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-800 
        flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:shadow-none 
        transition-all duration-300 ease-out z-50 overflow-hidden
        ${!isCollapsed && 'rounded-t-[3rem] md:rounded-t-none'}
      `}>
        {/* Toggle para escritorio */}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-1 rounded-r-lg z-50">
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Cabecera / Tirador para móvil */}
        <div 
          className="p-4 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between cursor-pointer md:cursor-default"
          onClick={() => { if(window.innerWidth < 768) setIsCollapsed(!isCollapsed); }}
        >
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Bot size={20} />
            </div>
            {(!isCollapsed || window.innerWidth < 768) && (
              <div>
                <h2 className="font-bold text-blue-800 dark:text-blue-300 text-[10px] uppercase tracking-widest">Sistema IA</h2>
                <span className="text-[9px] text-gray-400 font-bold uppercase">{isRecording ? '• Grabando' : '• Online'}</span>
              </div>
            )}
          </div>
          <div className="md:hidden">{isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
        </div>

        {(!isCollapsed || window.innerWidth >= 768) && (
          <div className="flex flex-col flex-1">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/20 dark:bg-slate-950/20">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 
                    m.role === 'error' ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-none' :
                    'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-100 border border-gray-100 dark:border-slate-700 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                </div>
              ))}
              {loading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin mx-auto" />}
            </div>

            {/* AREA DE INPUT: pb-32 para evitar la barra de Android */}
            <div className="p-4 pb-32 md:pb-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe o usa voz..."
                  className="w-full border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 pr-28 text-sm bg-white dark:bg-slate-800 dark:text-white resize-none h-20 shadow-inner"
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:text-blue-600 transition-all"><Paperclip size={18} /></button>
                  <button onClick={isRecording ? stopRecording : startRecording} className={`p-2.5 rounded-xl ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-500'}`}>{isRecording ? <MicOff size={18} /> : <Mic size={18} />}</button>
                  <button onClick={() => handleSend()} className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg"><Send size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default SidebarAI;
