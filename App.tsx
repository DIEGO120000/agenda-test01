import React, { useState, useEffect } from 'react';
import { Tarea, Nota, Pasatiempo, AppState, EstadoTarea, EventoHorario, PrioridadTarea } from './types';
import AgendaTable from './components/AgendaTable';
import SidebarAI from './components/SidebarAI';
import TaskForm from './components/TaskForm';
import Sections from './components/Sections';
import ScheduleSection from './components/ScheduleSection';
import { PlusCircle, Calendar, ClipboardList, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('agenda_app_state_v2');
      if (!saved) return { tareas: [], notas: [], pasatiempos: [], horario: [] };
      const parsed = JSON.parse(saved);
      return {
        tareas: Array.isArray(parsed.tareas) ? parsed.tareas : [],
        notas: Array.isArray(parsed.notas) ? parsed.notas : [],
        pasatiempos: Array.isArray(parsed.pasatiempos) ? parsed.pasatiempos : [],
        horario: Array.isArray(parsed.horario) ? parsed.horario : [],
      };
    } catch {
      return { tareas: [], notas: [], pasatiempos: [], horario: [] };
    }
  });

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('agenda_dark_mode') === 'true');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('agenda_app_state_v2', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('agenda_dark_mode', darkMode.toString());
  }, [darkMode]);

  // Handlers para la IA (Mapeo de Funciones)
  const bulkAddTasks = (nuevas: any[]) => {
    const mapped = nuevas.map(t => ({
      ...t,
      id: crypto.randomUUID(),
      ingreso: new Date().toISOString(),
      estado: EstadoTarea.PENDIENTE,
    }));
    setState(prev => ({ ...prev, tareas: [...prev.tareas, ...mapped] }));
  };

  const removeTasksByName = (nombres: string[]) => {
    setState(prev => ({ 
      ...prev, 
      tareas: prev.tareas.filter(t => !nombres.some(n => t.nombre.toLowerCase().includes(n.toLowerCase()))) 
    }));
  };

  const updateHorario = (eventos: any[]) => {
    const conId = eventos.map(e => ({ ...e, id: crypto.randomUUID() }));
    setState(prev => ({ ...prev, horario: [...prev.horario, ...conId] }));
  };

  const removeHorarioByCriteria = (criterios: string[]) => {
    setState(prev => ({
      ...prev,
      horario: prev.horario.filter(e => !criterios.some(c => e.actividad.toLowerCase().includes(c.toLowerCase())))
    }));
  };

  const bulkAddNotas = (textos: string[]) => {
    const mapped = textos.map(t => ({
      id: crypto.randomUUID(),
      contenido: t,
      timestamp: new Date().toISOString()
    }));
    setState(prev => ({ ...prev, notas: [...prev.notas, ...mapped] }));
  };

  const removeNotasByCriteria = (criterios: string[]) => {
    setState(prev => ({
      ...prev,
      notas: prev.notas.filter(n => !criterios.some(c => n.contenido.toLowerCase().includes(c.toLowerCase())))
    }));
  };

  const bulkAddPasatiempos = (nombres: string[]) => {
    const mapped = nombres.map(n => ({
      id: crypto.randomUUID(),
      nombre: n,
      completado: false
    }));
    setState(prev => ({ ...prev, pasatiempos: [...prev.pasatiempos, ...mapped] }));
  };

  const removePasatiemposByCriteria = (criterios: string[]) => {
    setState(prev => ({
      ...prev,
      pasatiempos: prev.pasatiempos.filter(p => !criterios.some(c => p.nombre.toLowerCase().includes(c.toLowerCase())))
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors duration-300">
      <main className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <Calendar className="text-blue-600" size={32} /> FORMATO A <span className="text-blue-600">CENTRAL</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1 ml-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 
              Sincronización de Agenda de Grado Activa
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-600" />}
            </button>
            <button onClick={() => setIsTaskFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black text-xs tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95 uppercase">
              <PlusCircle size={18} /> Nueva Tarea
            </button>
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden mb-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2 bg-gray-50/50 dark:bg-slate-800/30">
            <ClipboardList className="text-blue-600" size={18} />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">Módulo de Seguimiento Táctico</h2>
          </div>
          <AgendaTable 
            tareas={state.tareas} 
            now={currentTime}
            updateTask={(id, upds) => setState(p => ({ ...p, tareas: p.tareas.map(t => t.id === id ? {...t, ...upds} : t) }))}
            removeTask={(id) => setState(p => ({ ...p, tareas: p.tareas.filter(t => t.id !== id) }))}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 animate-in fade-in slide-in-from-bottom duration-700">
            <ScheduleSection 
              horario={state.horario} 
              onRemove={(id) => setState(p => ({ ...p, horario: p.horario.filter(e => e.id !== id) }))}
              onClear={() => setState(p => ({ ...p, horario: [] }))}
            />
          </div>
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-700">
            <Sections 
              notas={state.notas} 
              pasatiempos={state.pasatiempos}
              addNota={(c) => setState(p => ({ ...p, notas: [...p.notas, {id: crypto.randomUUID(), contenido: c, timestamp: new Date().toISOString()}] }))}
              removeNota={(id) => setState(p => ({ ...p, notas: p.notas.filter(n => n.id !== id) }))}
              addPasatiempo={(n) => setState(p => ({ ...p, pasatiempos: [...p.pasatiempos, {id: crypto.randomUUID(), nombre: n, completado: false}] }))}
              togglePasatiempo={(id) => setState(p => ({ ...p, pasatiempos: p.pasatiempos.map(p => p.id === id ? {...p, completado: !p.completado} : p) }))}
              removePasatiempo={(id) => setState(p => ({ ...p, pasatiempos: p.pasatiempos.filter(p => p.id !== id) }))}
            />
          </div>
        </div>
      </main>

      <SidebarAI 
        state={state}
        onAIAddTask={bulkAddTasks}
        onAIRemoveTasks={removeTasksByName}
        onAIUpdateHorario={updateHorario}
        onAIRemoveHorario={removeHorarioByCriteria}
        onAIAddNotas={bulkAddNotas}
        onAIRemoveNotas={removeNotasByCriteria}
        onAIAddPasatiempos={bulkAddPasatiempos}
        onAIRemovePasatiempos={removePasatiemposByCriteria}
      />

      {isTaskFormOpen && (
        <TaskForm 
          onClose={() => setIsTaskFormOpen(false)} 
          onSubmit={(t) => setState(p => ({ 
            ...p, 
            tareas: [...p.tareas, {...t, id: crypto.randomUUID(), ingreso: new Date().toISOString(), estado: EstadoTarea.PENDIENTE}] 
          }))} 
        />
      )}
    </div>
  );
};

export default App;