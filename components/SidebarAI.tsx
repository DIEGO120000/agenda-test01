import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';
import { getAIResponse } from '../services/geminiService';
import { Send, Bot, Mic, MicOff, Loader2, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, AlertCircle, Paperclip } from 'lucide-react';

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
  const [messages, setMessages] = useState<{ role: 'ai' | 'user' | 'error'; text: string }[]>([
    { role: 'ai', text: 'PROTOCOLO FORMATO A: NÚCLEO INICIALIZADO Y LISTO.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (
    audioData?: { data: string, mimeType: string }, 
    fileData?: { data: string, mimeType: string }
  ) => {
    const trimmedInput = input.trim();
    if (!trimmedInput && !audioData && !fileData || loading) return;
    
    let userMsg = trimmedInput;
    if (audioData) userMsg = "🎤 [COMANDO DE VOZ PROCESADO]";
    if (fileData) userMsg = `📎 [ARCHIVO DETECTADO: ${fileData.mimeType.split('/')[1].toUpperCase()}]`;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await getAIResponse(state, trimmedInput, audioData, fileData);
      const aiText = response.text || "ACCIÓN EJECUTADA. SINCRONIZANDO BASE DE DATOS...";
      
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
      
      if (response.functionCalls) {
        response.functionCalls.forEach(fc => {
          const args = fc.args as any;
          switch (fc.name) {
            case 'gestionar_agenda': if (args.tareas) onAIAddTask(args.tareas); break;
            case 'gestionar_horario': if (args.eventos) onAIUpdateHorario(args.eventos); break;
            case 'gestionar_notes': if (args.notes) onAIAddNotas(args.notes); break;
            case 'gestionar_pasatiempos': if (args.hobbies) onAIAddPasatiempos(args.hobbies); break;
            case 'eliminar_contenido':
              if (args.tipo === 'tarea') onAIRemoveTasks(args.criterios);
              if (args.tipo === 'horario') onAIRemoveHorario(args.criterios);
              if (args.tipo === 'nota') onAIRemoveNotas(args.criterios);
              if (args.tipo === 'pasatiempo') onAIRemovePasatiempos(args.criterios);
              break;
          }
        });
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'error', text: `FALLO DE NÚCLEO: ${error.message || 'DESCONOCIDO'}` }]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        if (audioBlob.size > 500) { 
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            handleSend({ data: base64, mimeType });
          };
          reader.readAsDataURL(audioBlob);
        }
        streamRef.current?.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'error', text: "ERROR: ACCESO A PERIFÉRICO DENEGADO." }]);
    }
  };

  return (
    <>
      {!isCollapsed && <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setIsCollapsed(true)} />}

      <aside className={`
        fixed bottom-0 left-0 w-full md:relative md:h-screen transition-all duration-500 z-50
        ${isCollapsed ? 'h-14 md:w-16' : 'h-[75vh] md:w-[380px]'}
        bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-l border-gray-200 dark:border-slate-800 flex flex-col shadow-2xl
      `}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="hidden md:flex absolute -left-4 top-12 bg-blue-600 text-white p-2 rounded-full shadow-xl hover:scale-110 transition-transform z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="h-14 bg-slate-900 flex items-center justify-between px-4 text-white shrink-0 cursor-pointer" onClick={() => window.innerWidth < 768 && setIsCollapsed(!isCollapsed)}>
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg bg-blue-600/20 text-blue-400 ${loading ? 'animate-pulse' : ''}`}>
              <Bot size={18} />
            </div>
            {(!isCollapsed || window.innerWidth < 768) && (
              <div className="flex flex-col">
                <span className="mono font-bold text-[10px] tracking-widest text-blue-400 uppercase leading-none">A-AI CORE</span>
                <span className="text-[7px] opacity-50 uppercase font-black tracking-tighter flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 pulse-status"></span> PROTOCOLO ACTIVO
                </span>
              </div>
            )}
          </div>
          <div className="md:hidden">{isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
        </div>

        {(!isCollapsed || window.innerWidth >= 768) && (
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] px-4 py-3 rounded-xl text-[12px] mono ${
                    m.role === 'user' ? 'bg-blue-600 text-white' : 
                    m.role === 'error' ? 'bg-red-950/20 text-red-500 border border-red-900/50' :
                    'bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}>
                    {m.role === 'ai' && <span className="text-[7px] block opacity-40 mb-1 tracking-[0.2em] uppercase font-black">Core Response</span>}
                    {m.role === 'user' && <span className="text-[7px] block opacity-40 mb-1 tracking-[0.2em] uppercase font-black text-right">User Command</span>}
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-xl flex items-center gap-2 border border-slate-200 dark:border-slate-800">
                    <Loader2 size={12} className="animate-spin text-blue-500" />
                    <span className="mono text-[10px] text-slate-500 uppercase tracking-widest font-bold">Analizando...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-2 py-1.5 border border-slate-200 dark:border-slate-700">
                <input type="file" ref={fileInputRef} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const r = new FileReader();
                    r.onloadend = () => handleSend(undefined, { data: (r.result as string).split(',')[1], mimeType: file.type });
                    r.readAsDataURL(file);
                  }
                  e.target.value = '';
                }} className="hidden" />
                
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                  title="Adjuntar Syllabus/Foto"
                >
                  <Paperclip size={18} />
                </button>
                
                <button 
                  onClick={isRecording ? () => mediaRecorderRef.current?.stop() : startRecording} 
                  className={`p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-red-500'}`}
                  title="Comando de Voz"
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="ORDEN TÁCTICA..."
                  className="flex-1 bg-transparent border-none py-2 px-1 text-xs focus:ring-0 outline-none dark:text-white resize-none max-h-32 mono font-bold"
                />
                
                <button 
                  onClick={() => handleSend()} 
                  disabled={loading}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md active:scale-90 transition-transform disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="mt-2 text-[6px] text-center text-slate-400 mono font-black uppercase tracking-[0.3em]">
                Protocolo Formato A v2.1 // Central Core
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default SidebarAI;