import React from "react";

interface TareasSearchProps {
  search: string;
  setSearch: (val: string) => void;
}

const TareasSearch: React.FC<TareasSearchProps> = ({ search, setSearch }) => {
  return (
    <div style={{ marginBottom: 8 }} role="search">
      <label htmlFor="search-task" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>Buscar tarea</label>
      <input
        id="search-task"
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por escenario o resultado esperado..."
        aria-label="Buscar tarea por escenario o resultado esperado"
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 10,
          border: '1.5px solid #b0bec5',
          fontSize: 17,
          outline: 'none',
          boxShadow: '0 1px 4px #0001',
          background: '#fff',
          marginBottom: 0,
        }}
      />
    </div>
  );
};

export default TareasSearch;