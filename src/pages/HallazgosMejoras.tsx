import React, { useState, useEffect,  } from 'react';
import { supabase } from '../supabaseClient';

interface Prueba {
  id: string;
  producto: string;
}

interface Hallazgo {
  id: string;
  recomendacion_mejora: string;
  frecuencia: string;
  severidad: string;
  prioridad: string;
  estado: string;
}

interface MensajeSistema {
  tipo: string;
  texto: string;
}

export default function HallazgosMejoras() {
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([]);
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  
  const [pruebaId, setPruebaId] = useState<string>('');
  const [frecuencia, setFrecuencia] = useState<string>('');
  const [severidad, setSeveridad] = useState<string>('Media');
  const [prioridad, setPrioridad] = useState<string>('Media');
  const [estado, setEstado] = useState<string>('Pendiente');
  const [recomendacion, setRecomendacion] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<MensajeSistema>({ tipo: '', texto: '' });

  useEffect(() => {
    fetchPruebas();
    fetchHallazgos();
  }, []);

  const fetchPruebas = async () => {
    const { data } = await supabase.from('pruebas_usabilidad').select('id, producto');
    if (data) setPruebas(data as unknown as Prueba[]);
  };

  const fetchHallazgos = async () => {
    const { data, error } = await supabase
      .from('hallazgos')
      .select('*, pruebas_usabilidad(producto)')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setHallazgos(data as unknown as Hallazgo[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (!pruebaId || !recomendacion || !frecuencia) {
      setMensaje({ tipo: 'error', texto: 'Por favor, completa los campos requeridos.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('hallazgos').insert([
      {
        prueba_id: pruebaId,
        frecuencia,
        severidad,
        prioridad,
        estado,
        recomendacion_mejora: recomendacion
      }
    ]);

    setLoading(false);

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al registrar el hallazgo: ' + error.message });
    } else {
      setMensaje({ tipo: 'exito', texto: 'Hallazgo registrado con éxito.' });
      setFrecuencia(''); 
      setRecomendacion('');
      fetchHallazgos();
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2>Síntesis de Hallazgos y Plan de Mejora</h2>
      <p>Consolida los problemas detectados y prioriza las soluciones.</p>

      {mensaje.texto && (
        <div aria-live="polite" style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', background: mensaje.tipo === 'error' ? '#f8d7da' : '#d4edda', color: mensaje.tipo === 'error' ? '#721c24' : '#155724' }}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        
        <div>
          <label htmlFor="prueba" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Plan de Prueba Asociado *</label>
          <select id="prueba" value={pruebaId} onChange={(e) => setPruebaId(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="">Seleccione un plan de prueba...</option>
            {pruebas.map(p => (
              <option key={p.id} value={p.id}>{p.producto}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="recomendacion" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Problema y Recomendación de Mejora *</label>
          <textarea id="recomendacion" value={recomendacion} onChange={(e) => setRecomendacion(e.target.value)} required rows={3} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Ej: Los usuarios no ven el botón. Recomiendo cambiar el color de contraste..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <div>
            <label htmlFor="frecuencia" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Frecuencia *</label>
            <input type="text" id="frecuencia" value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)} required placeholder="Ej: 3/5" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label htmlFor="severidad" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Severidad</label>
            <select id="severidad" value={severidad} onChange={(e) => setSeveridad(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
          <div>
            <label htmlFor="prioridad" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Prioridad</label>
            <select id="prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
          <div>
            <label htmlFor="estado" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Estado</label>
            <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Corregido">Corregido</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ padding: '12px 20px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          {loading ? 'Guardando...' : 'Registrar Hallazgo'}
        </button>
      </form>

      <hr style={{ margin: '40px 0', borderTop: '1px solid #eee' }} />

      <h3>Listado de Hallazgos</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f4f4f4' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Recomendación</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Frecuencia</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Severidad</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Prioridad</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {hallazgos.map(h => (
              <tr key={h.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{h.recomendacion_mejora}</td>
                <td style={{ padding: '12px' }}>{h.frecuencia}</td>
                <td style={{ padding: '12px' }}>{h.severidad}</td>
                <td style={{ padding: '12px' }}>{h.prioridad}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.85em', background: h.estado === 'Corregido' ? '#d4edda' : '#fff3cd', color: h.estado === 'Corregido' ? '#155724' : '#856404', border: h.estado === 'Corregido' ? '1px solid #c3e6cb' : '1px solid #ffeeba' }}>
                    {h.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}