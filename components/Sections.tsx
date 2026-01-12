
import React, { useState } from 'react';
import { Nota, Pasatiempo } from '../types';
import { Trash2, Plus, StickyNote, Gamepad2, CheckCircle2, Circle, Clock } from 'lucide-react';

interface Props {
  notas: Nota[];
  pasatiempos: Pasatiempo[];
  addNota: (text: string) => void;
  removeNota: (id: string) => void;
  addPasatiempo: (text: string) => void;
  togglePasatiempo: (id: string) => void;
  removePasatiempo: (id: string) => void;
}

const Sections: React.FC<Props> = ({ 
  notas, pasatiempos, addNota, removeNota, addPasatiempo, togglePasatiempo, removePasatiempo 
}) => {
  const [notaInput, setNotaInput] = useState('');
  const [pasatiempoInput, setPasatiempoInput] = useState('');

  const handleAddNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (notaInput.trim()) {
      addNota(notaInput);
      setNotaInput('');
    }
  };

  const handleAddPasatiempo = (e: React.FormEvent) => {
    e.preventDefault();
    if (pasatiempoInput.trim()) {
      addPasatiempo(pasatiempoInput);
      setPasatiempoInput('');
    }
  };

  const formatNoteTimestamp = (iso: string) => {
    const d = new Date(iso);
    const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    const date = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} ${date}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 🗒️ Notas */}
      <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/20 flex items-center justify-between">
          <h2 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
            <StickyNote size={18} /> 🗒️ Notas
          </h2>
        </div>
        <div className="p-4">
          <form onSubmit={handleAddNota} className="flex gap-2 mb-4">
            <input 
              className="flex-1 border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white dark:bg-slate-800 dark:text-white"
              placeholder="Añadir recordatorio, deuda..."
              value={notaInput}
              onChange={e => setNotaInput(e.target.value)}
            />
            <button className="bg-amber-500 text-white p-2 rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
              <Plus size={18} />
            </button>
          </form>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {notas.length === 0 ? (
              <p className="text-gray-400 dark:text-slate-500 text-sm italic py-2">No hay notas guardadas.</p>
            ) : (
              [...notas].reverse().map(n => (
                <div key={n.id} className="bg-amber-50/50 dark:bg-amber-900/5 p-3 rounded-lg border border-amber-100 dark:border-amber-900/20 flex flex-col group">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed flex-1">{n.contenido}</p>
                    <button 
                      onClick={() => removeNota(n.id)}
                      className="text-amber-300 dark:text-amber-800 hover:text-red-500 transition-colors ml-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-amber-600/60 dark:text-amber-400/50 mt-1 uppercase font-bold">
                    <Clock size={10} />
                    {n.timestamp ? formatNoteTimestamp(n.timestamp) : '--:-- --/--/----'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 🎯 Pasatiempos */}
      <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="p-4 bg-green-50 dark:bg-green-900/10 border-b border-green-100 dark:border-green-900/20 flex items-center justify-between">
          <h2 className="font-bold text-green-800 dark:text-green-400 flex items-center gap-2">
            <Gamepad2 size={18} /> 🎯 Pasatiempos
          </h2>
        </div>
        <div className="p-4">
          <form onSubmit={handleAddPasatiempo} className="flex gap-2 mb-4">
            <input 
              className="flex-1 border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-slate-800 dark:text-white"
              placeholder="Actividad de ocio..."
              value={pasatiempoInput}
              onChange={e => setPasatiempoInput(e.target.value)}
            />
            <button className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors shadow-sm">
              <Plus size={18} />
            </button>
          </form>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {pasatiempos.length === 0 ? (
              <p className="text-gray-400 dark:text-slate-500 text-sm italic py-2">No hay pasatiempos registrados.</p>
            ) : (
              pasatiempos.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-green-50/50 dark:bg-green-900/5 p-3 rounded-lg border border-green-100 dark:border-green-900/20 group">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => togglePasatiempo(p.id)}
                      className={`${p.completado ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-slate-600'} hover:text-green-500 transition-colors`}
                    >
                      {p.completado ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                    <span className={`text-sm ${p.completado ? 'line-through text-green-800/50 dark:text-green-400/50' : 'text-green-900 dark:text-green-100'}`}>
                      {p.nombre}
                    </span>
                  </div>
                  <button 
                    onClick={() => removePasatiempo(p.id)}
                    className="text-green-300 dark:text-green-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sections;
