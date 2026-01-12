
import React, { useState } from 'react';
import { Tarea, PrioridadTarea } from '../types';
import { X } from 'lucide-react';

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
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-gray-800 dark:text-white">Nueva Tarea Académica</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Nombre de la Tarea</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
              value={form.nombre}
              onChange={e => setForm({...form, nombre: e.target.value})}
              placeholder="Ej: Ensayo de Historia"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Fecha Recomendada</label>
              <input 
                type="date" 
                required
                className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                value={form.recomendado}
                onChange={e => setForm({...form, recomendado: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Fecha Culminación</label>
              <input 
                type="date" 
                required
                className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                value={form.culminacion}
                onChange={e => setForm({...form, culminacion: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Criticidad (1-10)</label>
              <input 
                type="number" 
                min="1" 
                max="11"
                className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
                value={form.criticidad}
                onChange={e => setForm({...form, criticidad: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Prioridad</label>
              <select 
                className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 dark:text-white"
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
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
          >
            Añadir a la Agenda
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
