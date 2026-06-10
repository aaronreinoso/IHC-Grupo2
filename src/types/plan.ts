export interface PlanPruebaShort {
  id: string;
  producto: string;
  duracion: string;
}

export interface PruebaUsabilidad {
  id: string;
  producto: string;
  objetivo?: string;
  dispositivo?: string;
  metodologia?: string;
  escenario_principal?: string;
  created_at?: string;
}

export interface Tarea {
  id: string;
  prueba_id: string;
  escenario: string;
  instrucciones?: string;
  created_at?: string;
}

export interface Observacion {
  id: string;
  sesion_id: string;
  tarea_id: string;
  exito: boolean;
  tiempo_segundos: number;
  errores: number;
  comentarios?: string;
  problema_detectado: string;
  severidad: string;
  mejora_propuesta?: string;
  created_at?: string;
  tareas?: Tarea;
}
