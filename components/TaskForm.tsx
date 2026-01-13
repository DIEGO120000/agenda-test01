
import React, { useState } from 'react';
import { Tarea, PrioridadTarea } from '../types';
import { X, Calendar, AlertTriangle, Star } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSubmit: (tarea: Omit<Tarea, 'id' | 'estado' | 'ingreso'>) => void;
}

const TaskForm: React.FC<Props> = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    nombre: '',
    recomendado: '',
    culminacion: '',
    criticidad: 5,
    prioridad: PrioridadTarea.MEDIA
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.recomendado || !form.culminacion) return;
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Calendar size={18} />
            </div>
            <h3 className="font-black text-[13px] uppercase tracking-[0.1em] text-gray-800 dark:text-white">Nueva Entrada Agenda</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase mb-2 tracking-widest">Nombre de la Tarea / Actividad</label>
            <input 
              type="text" 
              required
              autoFocus
              className="w-full border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none bg-white dark:bg-slate-800 dark:text-white transition-all shadow-sm"
              value={form.nombre}
              onChange={e => setForm({...form, nombre: e.target.value})}
              placeholder="Ej: Proyecto Final Ingeniería Software"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase mb-2 tracking-widest">Inicia (Recomendado)</label>
              <input 
                type="date" 
                required
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none bg-white dark:bg-slate-800 dark:text-white shadow-sm"
                value={form.recomendado}
                onChange={e => setForm({...form, recomendado: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase mb-2 tracking-widest">Entrega Final</label>
              <input 
                type="date" 
                required
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none bg-white dark:bg-slate-800 dark:text-white shadow-sm"
                value={form.culminacion}
                onChange={e => setForm({...form, culminacion: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                Criticidad <AlertTriangle size={10} className="text-yellow-500" />
              </label>
              <input 
                type="number" 
                min="1" 
                max="10"
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none bg-white dark:bg-slate-800 dark:text-white shadow-sm"
                value={form.criticidad}
                onChange={e => setForm({...form, criticidad: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                Categoría <Star size={10} className="text-blue-500" />
              </label>
              <select 
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none bg-white dark:bg-slate-800 dark:text-white shadow-sm appearance-none"
                value={form.prioridad}
                onChange={e => setForm({...form, prioridad: e.target.value as PrioridadTarea})}
              >
                {Object.values(PrioridadTarea).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] uppercase text-[11px] tracking-widest"
          >
            Sincronizar con Formato A
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
