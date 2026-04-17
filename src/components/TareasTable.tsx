import React, { useRef, useState, useEffect } from "react";
import type { Tarea } from "../types/tarea";

interface TareasTableProps {
  tareas: Tarea[];
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
}

// Subcomponente reutilizable para manejar la expansión de texto
const ExpandableText: React.FC<{ text: string; charLimit?: number; clampClass?: string }> = ({ 
  text, 
  charLimit = 60, 
  clampClass = "line-clamp-2" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text && text.length > charLimit;

  return (
    <div className="flex flex-col items-start w-full">
      <div 
        className={`${!isExpanded && shouldTruncate ? clampClass : ""} text-gray-800 break-words w-full font-medium`}
        title={!isExpanded ? text : undefined}
      >
        {text}
      </div>
      {shouldTruncate && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1 -ml-1 transition-colors"
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Ver menos" : "Ver más"}
        </button>
      )}
    </div>
  );
};

const TareasTable: React.FC<TareasTableProps> = ({ tareas, onEdit, onDelete }) => {
  const tableRef = useRef<HTMLTableElement>(null);
  
  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Si la lista de tareas cambia (ej. al buscar o eliminar), volvemos a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [tareas]);

  // Cálculos de paginación
  const totalPages = Math.ceil(tareas.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTareas = tareas.slice(indexOfFirstItem, indexOfLastItem);

  const displayStart = tareas.length === 0 ? 0 : indexOfFirstItem + 1;
  const displayEnd = Math.min(indexOfLastItem, tareas.length);

  return (
    <div 
      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col" 
      role="region" 
      aria-labelledby="table-caption" 
      tabIndex={0}
    >
      <div className="overflow-x-auto flex-grow">
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
              // Iteramos sobre `currentTareas` en lugar de `tareas`
              currentTareas.map(tarea => (
                <tr 
                  key={tarea.id} 
                  className="hover:bg-blue-50/60 focus-within:bg-blue-50/60 transition-colors" 
                  aria-rowindex={tareas.indexOf(tarea) + 1}
                >
                  <td className="p-4 align-top">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 break-words w-full">
                      {Array.isArray(tarea.pruebas_usabilidad) 
                        ? tarea.pruebas_usabilidad[0]?.producto 
                        : tarea.pruebas_usabilidad?.producto || "Sin asignar"}
                    </span>
                  </td>
                  
                  <td className="p-4 align-top">
                    <ExpandableText text={tarea.escenario} charLimit={60} clampClass="line-clamp-2" />
                  </td>
                  
                  <td className="p-4 align-top">
                    <ExpandableText text={tarea.resultado_esperado} charLimit={60} clampClass="line-clamp-2" />
                  </td>
                  
                  <td className="p-4 align-top">
                    <ExpandableText text={tarea.metrica_principal} charLimit={40} clampClass="line-clamp-2" />
                  </td>
                  
                  <td className="p-4 align-top">
                    <ExpandableText text={tarea.criterio_exito} charLimit={40} clampClass="line-clamp-2" />
                  </td>
                  
                  <td className="p-4 align-top text-center">
                    <div className="flex flex-col gap-2 items-center justify-center">
                      <button
                        onClick={() => onEdit(tarea.id, tarea.escenario)}
                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all flex justify-center items-center gap-1"
                        aria-label={`Editar tarea: ${tarea.escenario.substring(0, 20)}...`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(tarea.id, tarea.escenario)}
                        className="w-full px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-rose-300 transition-all flex justify-center items-center gap-1"
                        aria-label={`Eliminar tarea: ${tarea.escenario.substring(0, 20)}...`}
                      >
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

      {/* --- CONTROLES DE PAGINACIÓN --- */}
      {tareas.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-bold">{displayStart}</span> al <span className="font-bold">{displayEnd}</span> de <span className="font-bold">{tareas.length}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Generación dinámica de botones de página */}
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    aria-current={currentPage === i + 1 ? "page" : undefined}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      currentPage === i + 1
                        ? "z-10 bg-blue-600 text-white focus-visible:outline-blue-600"
                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TareasTable;