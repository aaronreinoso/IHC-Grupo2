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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" role="region" aria-labelledby="table-caption" tabIndex={0}>
      <div className="overflow-x-auto">
        <table 
          ref={tableRef}
          className="w-full text-left border-collapse"
          aria-label="Lista de tareas registradas"
        >
          <caption id="table-caption" className="sr-only">
            Tabla de tareas asignadas con sus respectivos detalles y acciones
          </caption>
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th scope="col" className="p-4 font-semibold border-b">Plan Asociado</th>
              <th scope="col" className="p-4 font-semibold border-b w-1/4">Escenario</th>
              <th scope="col" className="p-4 font-semibold border-b">Resultado Esperado</th>
              <th scope="col" className="p-4 font-semibold border-b hidden md:table-cell">Métrica Principal</th>
              <th scope="col" className="p-4 font-semibold border-b hidden lg:table-cell">Criterio de Éxito</th>
              <th scope="col" className="p-4 font-semibold border-b text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
            {tareas.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">No hay tareas registradas.</td></tr>
            ) : (
              tareas.map(tarea => (
                <tr key={tarea.id} className="hover:bg-blue-50/50 transition-colors" aria-rowindex={tareas.indexOf(tarea) + 1}>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {Array.isArray(tarea.pruebas_usabilidad) 
                        ? tarea.pruebas_usabilidad[0]?.producto 
                        : tarea.pruebas_usabilidad?.producto || "Sin asignar"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="line-clamp-3" title={tarea.escenario}>{tarea.escenario}</div>
                  </td>
                  <td className="p-4">
                    <div className="line-clamp-2" title={tarea.resultado_esperado}>{tarea.resultado_esperado}</div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="line-clamp-2">{tarea.metrica_principal}</div>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="line-clamp-2">{tarea.criterio_exito}</div>
                  </td>
                  <td className="p-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => onEdit(tarea.id, tarea.escenario)}
                      className="mr-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors"
                      aria-label={`Editar tarea`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(tarea.id, tarea.escenario)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
                      aria-label={`Eliminar tarea`}
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
    </div>
  );
};

export default TareasTable;