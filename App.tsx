
import React, { useState, useEffect } from 'react';
import { Tarea, Nota, Pasatiempo, AppState, EstadoTarea, EventoHorario } from './types';
import AgendaTable from './components/AgendaTable';
import SidebarAI from './components/SidebarAI';
import TaskForm from './components/TaskForm';
import Sections from './components/Sections';
import ScheduleSection from './components/ScheduleSection';
import { PlusCircle, Calendar, ClipboardList, Moon, Sun, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('agenda_app_state');
      if (!saved) return { tareas: [], notas: [], pasatiempos: [], horario: [] };
      const parsed = JSON.parse(saved);
      return {
        tareas: Array.isArray(parsed.tareas) ? parsed.tareas : [],
        notas: Array.isArray(parsed.notas) ? parsed.notas : [],
        pasatiempos: Array.isArray(parsed.pasatiempos) ? parsed.pasatiempos : [],
        horario: Array.isArray(parsed.horario) ? parsed.horario : [],
      };
    } catch (e) {
      console.error("Error al cargar estado inicial:", e);
      return { tareas: [], notas: [], pasatiempos: [], horario: [] };
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('agenda_dark_mode') === 'true';
    } catch { return false; }
  });

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('agenda_app_state', JSON.stringify(state));
    } catch (e) { console.error("Error al guardar estado:", e); }
  }, [state]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('agenda_dark_mode', darkMode.toString());
    } catch {}
  }, [darkMode]);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertTriangle size={64} className="text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Oops, el sistema encontró un error crítico</h1>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-bold mt-4"><RefreshCw size={20} /> Reiniciar</button>
      </div>
    );
  }

  const bulkAddTasks = (nuevasTareas: any[]) => {
    const tasksWithMetadata = nuevasTareas.map(t => ({
      nombre: t.nombre || 'Tarea sin nombre',
      recomendado: t.recomendado || new Date().toISOString(),
      culminacion: t.culminacion || new Date().toISOString(),
      criticidad: t.criticidad || 5,
      prioridad: t.prioridad || 'Media 🟡',
      id: crypto.randomUUID(),
      ingreso: new Date().toISOString(),
      estado: EstadoTarea.PENDIENTE,
    }));
    setState(prev => ({ ...prev, tareas: [...prev.tareas, ...tasksWithMetadata] }));
  };

  const removeTasksByName = (nombres: string[]) => {
    setState(prev => ({ ...prev, tareas: prev.tareas.filter(t => !nombres.some(n => t.nombre.toLowerCase().includes(n.toLowerCase()))) }));
  };

  const updateHorario = (eventos: any[]) => {
    const nuevosEventos = eventos.map(e => ({ ...e, id: crypto.randomUUID() }));
    setState(prev => ({ ...prev, horario: [...prev.horario, ...nuevosEventos] }));
  };

  const removeHorarioByCriteria = (criterios: any[]) => {
    setState(prev => ({ ...prev, horario: prev.horario.filter(e => !criterios.some(c => e.dia === c.dia && e.actividad.includes(c.actividad))) }));
  };

  const bulkAddNotas = (textos: string[]) => {
    const nuevas = textos.map(t => ({ id: crypto.randomUUID(), contenido: t, timestamp: new Date().toISOString() }));
    setState(prev => ({ ...prev, notas: [...prev.notas, ...nuevas] }));
  };

  const removeNotasByFragment = (fragmentos: string[]) => {
    setState(prev => ({ ...prev, notas: prev.notas.filter(n => !fragmentos.some(f => n.contenido.includes(f))) }));
  };

  const bulkAddPasatiempos = (textos: string[]) => {
    const nuevos = textos.map(t => ({ id: crypto.randomUUID(), nombre: t, completado: false }));
    setState(prev => ({ ...prev, pasatiempos: [...prev.pasatiempos, ...nuevos] }));
  };

  const removePasatiemposByName = (nombres: string[]) => {
    setState(prev => ({ ...prev, pasatiempos: prev.pasatiempos.filter(p => !nombres.some(n => p.nombre.includes(n))) }));
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-32 md:pb-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="text-blue-600 dark:text-blue-400" /> Agenda Formato A
            </h1>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Planificación Central</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg bg-gray-200 dark:bg-slate-800 transition-all shadow-sm">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsTaskFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-md">
              <PlusCircle size={20} /> Nueva Tarea
            </button>
          </div>
        </header>

        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden mb-8">
          <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 flex items-center gap-2 text-gray-700 dark:text-slate-300 font-bold uppercase text-xs">
            <ClipboardList size={18} className="text-blue-500" /> Tabla Principal
          </div>
          <AgendaTable 
            tareas={state.tareas} 
            updateTask={(id, updates) => setState(prev => ({ ...prev, tareas: prev.tareas.map(t => t.id === id ? {...t, ...updates} : t) }))} 
            removeTask={(id) => setState(prev => ({ ...prev, tareas: prev.tareas.filter(t => t.id !== id) }))}
            now={currentTime}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ScheduleSection horario={state.horario} onRemove={(id) => setState(prev => ({ ...prev, horario: prev.horario.filter(e => e.id !== id) }))} onClear={() => setState(prev => ({ ...prev, horario: [] }))} />
          </div>
          <div className="space-y-8">
            <Sections 
              notas={state.notas} pasatiempos={state.pasatiempos}
              addNota={(c) => setState(prev => ({ ...prev, notas: [...prev.notas, {id: crypto.randomUUID(), contenido: c, timestamp: new Date().toISOString()}] }))}
              removeNota={(id) => setState(prev => ({ ...prev, notas: prev.notas.filter(n => n.id !== id) }))}
              addPasatiempo={(n) => setState(prev => ({ ...prev, pasatiempos: [...prev.pasatiempos, {id: crypto.randomUUID(), nombre: n, completado: false}] }))}
              togglePasatiempo={(id) => setState(prev => ({ ...prev, pasatiempos: prev.pasatiempos.map(p => p.id === id ? {...p, completado: !p.completado} : p) }))}
              removePasatiempo={(id) => setState(prev => ({ ...prev, pasatiempos: prev.pasatiempos.filter(p => p.id !== id) }))}
            />
          </div>
        </div>
      </main>

      <SidebarAI 
        state={state} onAIAddTask={bulkAddTasks} onAIRemoveTasks={removeTasksByName}
        onAIUpdateHorario={updateHorario} onAIRemoveHorario={removeHorarioByCriteria}
        onAIAddNotas={bulkAddNotas} onAIRemoveNotas={removeNotasByFragment}
        onAIAddPasatiempos={bulkAddPasatiempos} onAIRemovePasatiempos={removePasatiemposByName}
      />

      {isTaskFormOpen && <TaskForm onClose={() => setIsTaskFormOpen(false)} onSubmit={(t) => setState(prev => ({ ...prev, tareas: [...prev.tareas, {...t, id: crypto.randomUUID(), ingreso: new Date().toISOString(), estado: EstadoTarea.PENDIENTE}] }))} />}
    </div>
  );
};

export default App;
