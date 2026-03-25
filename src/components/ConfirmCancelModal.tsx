import React from "react";
import Modal from "./Modal";

interface ConfirmCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmCancelModal: React.FC<ConfirmCancelModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal open={isOpen} onClose={onClose} title="¿Seguro que deseas cancelar?">
      <div style={{ marginBottom: 24, fontSize: '16px', color: '#444' }}>
        Perderás los cambios no guardados en este formulario. ¿Deseas continuar y salir?
      </div>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: 32 }}>
        <button
          onClick={onClose}
          style={{
            fontWeight: "bold",
            padding: '10px 20px',
            background: '#e0e0e0',
            color: '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          No, seguir editando
        </button>
        <button
          onClick={onConfirm}
          style={{
            fontWeight: "bold",
            padding: '10px 20px',
            background: '#e53935',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Sí, cancelar
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmCancelModal;
