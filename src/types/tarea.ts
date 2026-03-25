export interface Tarea {
  id: string;
  prueba_id: string;
  escenario: string;
  resultado_esperado: string;
  metrica_principal: string;
  criterio_exito: string;
  pruebas_usabilidad?: {
    producto: string;
  } | { producto: string }[] | null;
}
