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
    <div 
      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden" 
      role="region" 
      aria-labelledby="table-caption" 
      tabIndex={0}
    >
      {/* Contenedor responsivo para scroll horizontal en móviles */}
      <div className="overflow-x-auto">
        {/* Usamos min-w-[900px] para evitar que las columnas se aplasten en pantallas pequeñas */}
        <table 
          ref={tableRef}
          className="w-full min-w-[900px] text-left table-fixed border-collapse"
          aria-label="Lista de tareas registradas"
        >
          <caption id="table-caption" className="sr-only">
            Tabla de tareas asignadas con sus respectivos detalles y acciones
          </caption>
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider border-b border-gray-300">
              <th scope="col" className="p-4 font-bold w-[12%]">Plan Asociado</th>
              <th scope="col" className="p-4 font-bold w-[25%]">Escenario</th>
              <th scope="col" className="p-4 font-bold w-[22%]">Resultado Esperado</th>
              <th scope="col" className="p-4 font-bold w-[16%]">Métrica Principal</th>
              <th scope="col" className="p-4 font-bold w-[15%]">Criterio de Éxito</th>
              <th scope="col" className="p-4 font-bold w-[10%] text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700 text-sm">
            {tareas.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">
                  No hay tareas registradas para este plan.
                </td>
              </tr>
            ) : (
              tareas.map(tarea => (
                <tr 
                  key={tarea.id} 
                  className="hover:bg-blue-50/60 focus-within:bg-blue-50/60 transition-colors" 
                  aria-rowindex={tareas.indexOf(tarea) + 1}
                >
                  {/* Se agregó align-top para que el texto siempre inicie arriba si otra celda es más grande */}
                  <td className="p-4 align-top">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                      {Array.isArray(tarea.pruebas_usabilidad) 
                        ? tarea.pruebas_usabilidad[0]?.producto 
                        : tarea.pruebas_usabilidad?.producto || "Sin asignar"}
                    </span>
                  </td>
                  <td className="p-4 align-top">
                    {/* line-clamp-3 limita a 3 líneas. El atributo title permite ver todo al pasar el mouse */}
                    <div className="line-clamp-3 text-gray-900 font-medium" title={tarea.escenario}>
                      {tarea.escenario}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="line-clamp-3 text-gray-700" title={tarea.resultado_esperado}>
                      {tarea.resultado_esperado}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="line-clamp-2 text-gray-600" title={tarea.metrica_principal}>
                      {tarea.metrica_principal}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="line-clamp-2 text-gray-600" title={tarea.criterio_exito}>
                      {tarea.criterio_exito}
                    </div>
                  </td>
                  <td className="p-4 align-top text-center">
                    {/* Botones apilados con nuevos colores y anillos de foco para accesibilidad */}
                    <div className="flex flex-col gap-2 items-center justify-center">
                      <button
                        onClick={() => onEdit(tarea.id, tarea.escenario)}
                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all flex justify-center items-center gap-1"
                        aria-label={`Editar tarea: ${tarea.escenario.substring(0, 20)}...`}
                      >
                        {/* Ícono de lápiz para accesibilidad visual */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(tarea.id, tarea.escenario)}
                        className="w-full px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-rose-300 transition-all flex justify-center items-center gap-1"
                        aria-label={`Eliminar tarea: ${tarea.escenario.substring(0, 20)}...`}
                      >
                        {/* Ícono de basura */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Eliminar
                      </button>
                    </div>
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