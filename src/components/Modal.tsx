import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)", // Un poco más oscuro para mejor contraste
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px" // Margen de seguridad para pantallas pequeñas
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          minWidth: 350,
          maxWidth: 600,
          width: "100%",
          padding: 32,
          boxShadow: "0 4px 24px #0002",
          position: "relative",
          maxHeight: "90vh", // CLAVE 1: No exceder el 90% de la altura de la ventana
          overflowY: "auto", // CLAVE 2: Activar scroll vertical si el contenido es muy largo
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          aria-label="Cerrar"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            color: "#888",
            zIndex: 10 // Asegurar que el botón esté por encima del contenido
          }}
        >
          ×
        </button>
        {title && <h2 style={{ marginTop: 0, marginBottom: "20px" }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;