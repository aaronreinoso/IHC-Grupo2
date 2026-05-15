import React, { useEffect, useState } from "react";
import Modal from "./Modal";

interface ConfirmCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmCancelModal: React.FC<ConfirmCancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsLeaving(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (isLeaving) return;

    setIsLeaving(true);

    try {
      await Promise.resolve(onConfirm());
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={isLeaving ? () => {} : onClose}
      title="¿Deseas salir sin guardar?"
    >
      <div className="space-y-5">
        <div
          className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4"
          role="alert"
          aria-live="assertive"
        >
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700"
            aria-hidden="true"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3.75m0 3.75h.008v.008H12V16.5zM10.29 3.86L1.82 18a1.5 1.5 0 001.29 2.25h17.78A1.5 1.5 0 0022.18 18L13.71 3.86a1.5 1.5 0 00-2.42 0z"
              />
            </svg>
          </div>

          <div>
            <p className="text-sm font-bold text-amber-900">
              Hay cambios que podrían perderse.
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              Si sales ahora, la información que escribiste en este formulario
              no se guardará. Puedes volver para seguir editando o confirmar que
              deseas salir.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          <strong>Recomendación:</strong> revisa si ya completaste la
          información importante antes de cancelar. Guardar evita que tengas que
          escribirla nuevamente.
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLeaving}
            className="
              w-full
              rounded-xl
              bg-blue-700
              px-5
              py-3
              text-sm
              font-bold
              text-white
              shadow-md
              transition-colors
              hover:bg-blue-800
              focus:outline-none
              focus:ring-4
              focus:ring-blue-200
              disabled:cursor-not-allowed
              disabled:bg-blue-300
              sm:w-auto
            "
          >
            Seguir editando
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLeaving}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gray-200
              px-5
              py-3
              text-sm
              font-bold
              text-gray-800
              transition-colors
              hover:bg-gray-300
              focus:outline-none
              focus:ring-4
              focus:ring-gray-300
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:w-auto
            "
          >
            {isLeaving && (
              <span
                className="h-5 w-5 rounded-full border-2 border-gray-700 border-t-transparent animate-spin"
                aria-hidden="true"
              />
            )}
            {isLeaving ? "Saliendo..." : "Salir sin guardar"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmCancelModal;
