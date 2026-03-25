import React from "react";
import type { PlanPruebaShort } from "../types/plan";

interface PlanDatalistProps {
  planesList: PlanPruebaShort[];
  inputPlanText: string;
  setInputPlanText: (val: string) => void;
  error?: string;
  onChangePlanId: (id: string) => void;
}

const PlanDatalist: React.FC<PlanDatalistProps> = ({
  planesList,
  inputPlanText,
  setInputPlanText,
  error,
  onChangePlanId
}) => {
  const errorId = "prueba_id_visual-error";
  
  return (
    <div style={{ marginBottom: '16px' }} role="group" aria-labelledby="plan-datalist-label">
      <label id="plan-datalist-label" htmlFor="prueba_id_visual" style={{ fontWeight: 'bold' }}>
        Plan de Prueba (Asociado): <span style={{ color: 'red' }} aria-hidden="true">*</span>
      </label>
      <input 
        id="prueba_id_visual"
        list="planesDePrueba"
        name="prueba_id_visual" 
        value={inputPlanText} 
        onChange={(e) => {
          setInputPlanText(e.target.value);
          const selected = planesList.find(p => p.producto === e.target.value);
          onChangePlanId(selected ? selected.id : '');
        }}
        onBlur={(e) => {
          const selected = planesList.find(p => p.producto === e.target.value);
          if (!selected) {
             setInputPlanText("");
             onChangePlanId("");
          }
        }}
        placeholder="Escribe o selecciona un plan de prueba..."
        style={{ 
          width: '100%', padding: '12px 16px', borderRadius: '8px', 
          border: error ? '2px solid #d32f2f' : '1px solid #b0bec5', 
          fontSize: '16px', marginTop: '8px' 
        }}
        required
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        autoComplete="off"
      />
      <datalist id="planesDePrueba">
        {planesList.map(plan => (
          <option key={plan.id} value={plan.producto} />
        ))}
      </datalist>
      {error && (
        <div id={errorId} role="alert" style={{ color: '#d32f2f', fontSize: '14px', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default PlanDatalist;