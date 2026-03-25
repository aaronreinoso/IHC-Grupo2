import React, { useRef } from "react";
import type { Tarea } from "../types/tarea";

interface TareasTableProps {
  tareas: Tarea[];
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
}

const TareasTable: React.FC<TareasTableProps> = ({ tareas, onEdit, onDelete }) => {
  const tableRef = useRef<HTMLTableElement>(null);

  return (
    <div style={{ overflowX: 'auto' }} role="region" aria-labelledby="table-caption" tabIndex={0}>
      <table 
        ref={tableRef}
        style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, background: '#fff', borderRadius: 8 }}
        aria-label="Lista de tareas registradas"
      >
        <caption id="table-caption" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
          Tabla de tareas asignadas con sus respectivos detalles y acciones
        </caption>
        <thead>
          <tr style={{ background: "#e3eafc" }}>
            <th scope="col" style={{ padding: 10, textAlign: 'left' }}>Plan Asociado</th>
            <th scope="col" style={{ padding: 10, textAlign: 'left' }}>Escenario</th>
            <th scope="col" style={{ padding: 10, textAlign: 'left' }}>Resultado Esperado</th>
            <th scope="col" style={{ padding: 10, textAlign: 'left' }}>Métrica Principal</th>
            <th scope="col" style={{ padding: 10, textAlign: 'left' }}>Criterio de Éxito</th>
            <th scope="col" style={{ padding: 10, textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tareas.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: "center", padding: 24 }}>No hay tareas registradas.</td></tr>
          ) : (
            tareas.map(tarea => (
              <tr key={tarea.id} style={{ borderBottom: '1px solid #eee' }} aria-rowindex={tareas.indexOf(tarea) + 1}>
                <td style={{ padding: 10 }}>
                  <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 'bold' }}>
                    {Array.isArray(tarea.pruebas_usabilidad) 
                      ? tarea.pruebas_usabilidad[0]?.producto 
                      : tarea.pruebas_usabilidad?.producto || "Sin asignar"}
                  </span>
                </td>
                <td style={{ padding: 10 }}>{tarea.escenario}</td>
                <td style={{ padding: 10 }}>{tarea.resultado_esperado}</td>
                <td style={{ padding: 10 }}>{tarea.metrica_principal}</td>
                <td style={{ padding: 10 }}>{tarea.criterio_exito}</td>
                <td style={{ padding: 10, minWidth: '170px', textAlign: 'center' }}>
                  <button
                    style={{ marginRight: 8, background: '#43a047', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => onEdit(tarea.id, tarea.escenario)}
                    aria-label={`Editar tarea de escenario: ${tarea.escenario}`}
                  >
                    Editar
                  </button>
                  <button
                    style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => onDelete(tarea.id, tarea.escenario)}
                    aria-label={`Eliminar tarea de escenario: ${tarea.escenario}`}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TareasTable;