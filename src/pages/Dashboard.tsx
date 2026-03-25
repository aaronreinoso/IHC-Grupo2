import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";


export default function Dashboard() {
  const { id } = useParams();
  const [duracion, setDuracion] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    setLoading(true);
    setFeedback("");

    const [
      { data: duracionData, error: duracionError },
      { data: tareasData, error: tareasError },
    ] = await Promise.all([
      supabase
        .from("pruebas_usabilidad")
        .select("duracion"),

      supabase
        .from("tareas")
        .select("criterio_exito"),
    ]);

    if (duracionError || tareasError) {
      setFeedback("Error al cargar los datos");
    } else {
      setDuracion(duracionData || []);
      setTareas(tareasData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
      fetchData();
    }, []);

  const indicadores = useMemo(() => {
  const totalTareas = tareas.length;

  const tareasExitosas = tareas.filter(
    (t) =>
      t.criterio_exito === true ||
      t.criterio_exito === "true" ||
      t.criterio_exito === "cumplido" ||
      t.criterio_exito === "éxito" ||
      t.criterio_exito === "exito"
  ).length;

  const porcentajeExito =
    totalTareas > 0
      ? ((tareasExitosas / totalTareas) * 100).toFixed(1)
      : "0.0";

  const duracionesEnSegundos = duracion
    .map((d) => {
      if (!d.duracion) return NaN;

      const partes = d.duracion.split(":").map(Number);
      if (partes.length !== 3 || partes.some(isNaN)) return NaN;

      const [horas, minutos, segundos] = partes;
      return horas * 3600 + minutos * 60 + segundos;
    })
    .filter((n) => !isNaN(n));

  const promedioSegundos =
    duracionesEnSegundos.length > 0
      ? duracionesEnSegundos.reduce((acc, item) => acc + item, 0) /
        duracionesEnSegundos.length
      : 0;

  const formatearTiempo = (totalSegundos: number) => {
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = Math.floor(totalSegundos % 60);

    return [
      String(horas).padStart(2, "0"),
      String(minutos).padStart(2, "0"),
      String(segundos).padStart(2, "0"),
    ].join(":");
  };

  const tiempoPromedio = formatearTiempo(promedioSegundos);

  return {
    totalTareas,
    tareasExitosas,
    porcentajeExito,
    tiempoPromedio,
  };
}, [tareas, duracion]);

  return (
    <main style={{ padding: "24px" }} aria-labelledby="dashboard-title">
      <h1 id="dashboard-title">Dashboard principal</h1>

      {loading && <p>Cargando datos...</p>}
      {feedback && <p style={{ color: "red" }}>{feedback}</p>}

      {!loading && !feedback && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          <div style={cardStyle}>
            <h3>Total de tareas</h3>
            <p style={numberStyle}>{indicadores.totalTareas}</p>
          </div>

          <div style={cardStyle}>
            <h3>Criterios de éxito cumplidos</h3>
            <p style={numberStyle}>{indicadores.tareasExitosas}</p>
          </div>

          <div style={cardStyle}>
            <h3>Porcentaje de éxito</h3>
            <p style={numberStyle}>{indicadores.porcentajeExito}%</p>
          </div>

          <div style={cardStyle}>
            <h3>Tiempo promedio</h3>
            <p style={numberStyle}>{indicadores.tiempoPromedio}</p>
          </div>
        </div>
      )}
    </main>
  );
}

const cardStyle = {
  background: "#fff",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const numberStyle = {
  fontSize: "2rem",
  fontWeight: "bold" as const,
  margin: 0,
};