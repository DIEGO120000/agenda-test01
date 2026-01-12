
export enum EstadoTarea {
  PENDIENTE = 'Pendiente',
  ATRASADA = 'Tarea Atrasada',
  REALIZADA = '✓ Realizada'
}

export enum PrioridadTarea {
  ALTA = 'Alta 🔴',
  MEDIA = 'Media 🟡',
  BAJA = 'Baja 🟢',
  PASATIEMPO = '🎯 Pasatiempo'
}

export interface Tarea {
  id: string;
  nombre: string;
  ingreso: string; // ISO Date
  recomendado: string; // ISO Date
  culminacion: string; // ISO Date
  criticidad: number;
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
}

export interface Nota {
  id: string;
  contenido: string;
  timestamp: string; // ISO Date
}

export interface Pasatiempo {
  id: string;
  nombre: string;
  completado: boolean;
}

export interface EventoHorario {
  id: string;
  dia: string; // 'Lunes', 'Martes', etc.
  hora: string; // '08:00'
  horaFin: string; // '10:00'
  actividad: string;
  tipo: 'clase' | 'estudio' | 'descanso';
  modalidad?: 'Virtual' | 'Semipresencial' | 'Presencial';
}

export interface AppState {
  tareas: Tarea[];
  notas: Nota[];
  pasatiempos: Pasatiempo[];
  horario: EventoHorario[];
}
