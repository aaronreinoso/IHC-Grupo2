import React from "react";
import Modal from "./Modal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName = "este elemento" 
}) => {
  return (
    <Modal open={isOpen} onClose={onClose} title="¿Seguro que deseas eliminar?">
      <div style={{ marginBottom: 24, fontSize: '16px', color: '#444' }}>
        ¿Estás seguro de que deseas eliminar {itemName}? Esta acción no se puede deshacer.
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
          Cancelar
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
          Sí, eliminar
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
