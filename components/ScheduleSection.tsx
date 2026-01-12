
import React from 'react';
import { EventoHorario } from '../types';
import { Clock, Trash2, CalendarDays, BookOpen, Coffee, GraduationCap, Monitor, Users, MapPin } from 'lucide-react';

interface Props {
  horario: EventoHorario[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const ScheduleSection: React.FC<Props> = ({ horario, onRemove, onClear }) => {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const normalize = (str: string) => 
    (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const formatToAmPm = (time24: string) => {
    if (!time24 || typeof time24 !== 'string' || !time24.includes(':')) return time24 || '';
    try {
      const parts = time24.split(':');
      if (parts.length < 2) return time24;
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      const minutesStr = isNaN(minutes) ? '00' : (minutes < 10 ? `0${minutes}` : minutes.toString());
      return `${hours12}:${minutesStr} ${period}`;
    } catch (e) {
      return time24;
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'clase': return <GraduationCap size={16} className="text-blue-500" />;
      case 'estudio': return <BookOpen size={16} className="text-purple-500" />;
      case 'descanso': return <Coffee size={16} className="text-orange-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getModalityBadge = (modalidad?: string) => {
    if (!modalidad) return null;
    let icon = <Monitor size={10} />;
    let color = 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800'; 
    
    if (modalidad === 'Presencial') {
      icon = <MapPin size={10} />;
      color = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800'; 
    } else if (modalidad === 'Semipresencial') {
      icon = <Users size={10} />;
      color = 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800'; 
    }

    return (
      <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider shadow-sm ml-auto ${color}`}>
        {icon} {modalidad}
      </span>
    );
  };

  return (
    <section id="schedule-section" className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-300 flex flex-col h-full min-h-[400px]">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/20 flex items-center justify-between">
        <h2 className="font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-2 uppercase text-xs tracking-widest">
          <CalendarDays size={18} /> Schedule / Horario Validado
        </h2>
        {horario.length > 0 && (
          <button 
            onClick={onClear}
            className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors uppercase font-bold border border-red-100 dark:border-red-900/30"
          >
            Limpiar Todo
          </button>
        )}
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[600px]">
        {horario.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock size={48} className="text-gray-200 dark:text-slate-800 mb-2" />
            <p className="text-gray-400 dark:text-slate-500 text-sm italic max-w-[250px]">Pega tu horario académico en el chat para que el sistema lo procese automáticamente.</p>
          </div>
        ) : (
          dias.map(dia => {
            const normDia = normalize(dia);
            const eventosDelDia = horario
              .filter(e => normalize(e.dia || "") === normDia)
              .sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));

            if (eventosDelDia.length === 0) return null;

            return (
              <div key={dia} className="space-y-2">
                <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase border-b border-gray-100 dark:border-slate-800 pb-1 tracking-widest">{dia}</h3>
                <div className="grid gap-2">
                  {eventosDelDia.map(evento => (
                    <div 
                      key={evento.id} 
                      className={`flex items-center justify-between p-3 rounded-xl border group transition-all duration-200 hover:shadow-md ${
                        evento.tipo === 'clase' ? 'bg-blue-50/40 dark:bg-blue-900/5 border-blue-100 dark:border-blue-900/20' : 
                        evento.tipo === 'estudio' ? 'bg-purple-50/40 dark:bg-purple-900/5 border-purple-100 dark:border-purple-900/20' :
                        'bg-orange-50/40 dark:bg-orange-900/5 border-orange-100 dark:border-orange-900/20'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex flex-col items-center justify-center min-w-[85px] font-mono text-[9px] font-bold text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm">
                          <span className="text-gray-800 dark:text-white whitespace-nowrap">{formatToAmPm(evento.hora)}</span>
                          <div className="w-full h-[1px] bg-gray-100 dark:bg-slate-700 my-0.5"></div>
                          <span className="text-gray-400 dark:text-slate-500 whitespace-nowrap">{formatToAmPm(evento.horaFin)}</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            {getIcon(evento.tipo)}
                            <span className="text-sm font-bold text-gray-800 dark:text-slate-100">{evento.actividad}</span>
                          </div>
                          <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase font-semibold tracking-tighter mt-0.5">
                            {evento.tipo === 'clase' ? 'Sesión Universitaria' : evento.tipo === 'estudio' ? 'Foco de Estudio' : 'Recuperación'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {evento.tipo === 'clase' && getModalityBadge(evento.modalidad)}
                        <button 
                          onClick={() => onRemove(evento.id)}
                          className="text-gray-300 dark:text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          title="Remover evento"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="p-3 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-gray-400">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Virtual
        </div>
        <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-gray-400">
           <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Presencial
        </div>
        <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-gray-400">
           <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Semi
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
