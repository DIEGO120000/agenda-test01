
import React, { useMemo } from 'react';
import { Tarea, EstadoTarea, PrioridadTarea } from '../types';
import { differenceInSeconds, parseISO, startOfDay, isBefore } from 'date-fns';
import { CheckCircle, Trash2, Timer, Zap } from 'lucide-react';

interface Props {
  tareas: Tarea[];
  updateTask: (id: string, updates: Partial<Tarea>) => void;
  removeTask: (id: string) => void;
  now: Date;
}

const AgendaTable: React.FC<Props> = ({ tareas, updateTask, removeTask, now }) => {
  
  // Función para calcular la prioridad dinámica (0 a 100+)
  const calculateDynamicPriority = (tarea: Tarea) => {
    const culmDate = new Date(tarea.culminacion);
    culmDate.setHours(23, 59, 59, 999);
    
    const totalSeconds = differenceInSeconds(culmDate, now);
    const hoursRemaining = totalSeconds / 3600;
    
    // 1. Base por Criticidad (0-40 puntos)
    let score = tarea.criticidad * 4;
    
    // 2. Bonus por Urgencia
    if (totalSeconds <= 0) {
      // Tarea Atrasada: Máxima prioridad
      score += 1000 + (tarea.criticidad * 10); 
    } else if (hoursRemaining < 24) {
      // Menos de un día: Gran incremento
      score += 60 + (tarea.criticidad * 2);
    } else if (hoursRemaining < 72) {
      // Menos de 3 días: Incremento moderado
      score += 30 + tarea.criticidad;
    } else if (hoursRemaining < 168) {
      // Menos de una semana
      score += 10;
    }

    // 3. Determinar Etiqueta Visual basada en el Score
    let label = PrioridadTarea.BAJA;
    if (score > 100) label = PrioridadTarea.ALTA;
    else if (score > 50) label = PrioridadTarea.MEDIA;
    
    // Excepción: Si el usuario la marcó como pasatiempo manualmente, respetamos la etiqueta pero el orden es dinámico
    if (tarea.prioridad === PrioridadTarea.PASATIEMPO) {
      label = PrioridadTarea.PASATIEMPO;
      score = score / 2; // Los pasatiempos pesan menos en el orden
    }

    return { score, label };
  };

  // Memorizamos las tareas calculadas y ordenadas para optimizar rendimiento
  const processedTasks = useMemo(() => {
    return tareas.map(t => ({
      ...t,
      dynamic: calculateDynamicPriority(t)
    })).sort((a, b) => b.dynamic.score - a.dynamic.score);
  }, [tareas, now]);

  const getStatus = (tarea: Tarea): EstadoTarea => {
    const culmDate = startOfDay(parseISO(tarea.culminacion));
    const today = startOfDay(now);
    if (isBefore(culmDate, today)) {
      return EstadoTarea.ATRASADA;
    }
    return tarea.estado;
  };

  const getTimeRemaining = (culm: string) => {
    const culmDate = parseISO(culm);
    const targetDate = new Date(culmDate);
    targetDate.setHours(23, 59, 59, 999);
    
    const totalSeconds = differenceInSeconds(targetDate, now);
    if (totalSeconds <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return { days, hours, minutes, seconds, expired: false };
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-gray-100 dark:bg-slate-800/80 text-gray-600 dark:text-slate-400 uppercase text-xs font-bold border-b border-gray-200 dark:border-slate-800">
            <th className="px-4 py-3 w-12 text-center"><Zap size={14} className="inline text-blue-500" /></th>
            <th className="px-4 py-3">Tarea</th>
            <th className="px-4 py-3">Ingreso</th>
            <th className="px-4 py-3">Recomendado</th>
            <th className="px-4 py-3">Culminación</th>
            <th className="px-4 py-3">Tiempo Restante</th>
            <th className="px-4 py-3">Criticidad</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right pr-8">Prioridad Dinámica</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900">
          {processedTasks.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500 italic">No hay tareas pendientes en la agenda.</td>
            </tr>
          ) : (
            processedTasks.map((tarea, index) => {
              const currentStatus = getStatus(tarea);
              const { days, hours, minutes, seconds, expired } = getTimeRemaining(tarea.culminacion);

              return (
                <tr key={tarea.id} className={`border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group ${expired ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                  <td className="px-4 py-4 text-center">
                    <span className="text-[10px] font-mono font-bold text-gray-400">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-800 dark:text-white">
                    <div className="flex items-center gap-2">
                      {tarea.nombre}
                      <button 
                        onClick={() => updateTask(tarea.id, { estado: EstadoTarea.REALIZADA })}
                        className="opacity-0 group-hover:opacity-100 text-green-500 hover:text-green-600 transition-all ml-2"
                        title="Marcar como completada"
                      >
                        <CheckCircle size={18} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-slate-300 group-hover:text-gray-400 transition-colors">{formatDate(tarea.ingreso)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-slate-300 group-hover:text-gray-400 transition-colors">{formatDate(tarea.recomendado)}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-slate-300 group-hover:text-gray-400 transition-colors">{formatDate(tarea.culminacion)}</td>
                  <td className="px-4 py-4">
                    {expired ? (
                      <span className="text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-tighter animate-pulse">
                        ¡VENCIDA!
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Timer size={14} className={`${days === 0 ? 'text-red-500 animate-pulse' : 'text-blue-500 group-hover:text-gray-400 transition-colors'}`} />
                        <span className={`font-bold transition-colors ${days === 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white group-hover:text-gray-400'}`}>
                          {days}d {hours.toString().padStart(2, '0')}h {minutes.toString().padStart(2, '0')}m <span className="text-blue-500 group-hover:text-gray-400 transition-colors">{seconds.toString().padStart(2, '0')}s</span>
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${tarea.criticidad > 7 ? 'bg-red-500' : tarea.criticidad > 4 ? 'bg-yellow-500' : 'bg-green-500'} group-hover:bg-gray-400`}
                          style={{ width: `${tarea.criticidad * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold font-mono group-hover:text-gray-400 transition-colors">{tarea.criticidad}/10</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold">
                    <span className={`px-2 py-1 rounded-full transition-colors ${
                      currentStatus === EstadoTarea.ATRASADA ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    } group-hover:bg-gray-200 dark:group-hover:bg-slate-700 group-hover:text-gray-500`}>
                      {currentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right pr-4">
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex flex-col items-end">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border transition-colors ${
                          tarea.dynamic.label === PrioridadTarea.ALTA ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                          tarea.dynamic.label === PrioridadTarea.MEDIA ? 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                          tarea.dynamic.label === PrioridadTarea.BAJA ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                          'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
                        } group-hover:bg-gray-100 group-hover:text-gray-500 group-hover:border-gray-300 dark:group-hover:bg-slate-800`}>
                          {tarea.dynamic.label}
                        </span>
                        <span className="text-[8px] font-mono text-gray-400 dark:text-slate-600 mt-1 uppercase tracking-tighter">
                          Rango IA: {Math.round(tarea.dynamic.score)}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          if (window.confirm('¿Eliminar esta tarea definitivamente?')) {
                            removeTask(tarea.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AgendaTable;
