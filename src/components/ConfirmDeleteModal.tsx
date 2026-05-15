import React, { useEffect, useState } from "react";
import Modal from "./Modal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string | null;
}

const CONFIRM_WORD = "ELIMINAR";

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = "este elemento",
}) => {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizedItemName = itemName?.trim() || "este elemento";
  const canDelete = confirmationText.trim().toUpperCase() === CONFIRM_WORD;

  useEffect(() => {
    if (!isOpen) {
      setConfirmationText("");
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!canDelete || isDeleting) return;

    setIsDeleting(true);

    try {
      await Promise.resolve(onConfirm());
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={isDeleting ? () => {} : onClose}
      title="Confirmar eliminación"
    >
      <div className="space-y-5">
        <div
          className="flex gap-3 rounded-xl border border-red-300 bg-red-50 p-4"
          role="alert"
          aria-live="assertive"
        >
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700"
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
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a1.5 1.5 0 001.29 2.25h17.78A1.5 1.5 0 0022.18 18L13.71 3.86a1.5 1.5 0 00-2.42 0z"
              />
            </svg>
          </div>

          <div>
            <p className="text-sm font-bold text-red-800">
              Esta acción es permanente.
            </p>
            <p className="mt-1 text-sm leading-6 text-red-800">
              Vas a eliminar <strong>{normalizedItemName}</strong>. Una vez
              confirmado, no podrás recuperar este registro desde la plataforma.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <label
            htmlFor="delete-confirmation"
            className="block text-sm font-semibold text-gray-800"
          >
            Para continuar, escribe{" "}
            <span className="font-bold text-red-700">{CONFIRM_WORD}</span>
          </label>

          <input
            id="delete-confirmation"
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            disabled={isDeleting}
            placeholder="Escribe ELIMINAR"
            aria-describedby="delete-confirmation-help"
            className={`
              mt-2
              w-full
              rounded-xl
              border-2
              bg-white
              px-4
              py-3
              text-sm
              text-gray-900
              placeholder:text-gray-500
              outline-none
              transition-colors
              ${
                confirmationText.length === 0
                  ? "border-gray-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                  : canDelete
                  ? "border-emerald-500 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  : "border-amber-500 focus:border-amber-600 focus:ring-4 focus:ring-amber-100"
              }
            `}
          />

          <p
            id="delete-confirmation-help"
            className={`mt-2 text-xs font-medium ${
              canDelete
                ? "text-emerald-700"
                : confirmationText.length > 0
                ? "text-amber-700"
                : "text-gray-600"
            }`}
            aria-live="polite"
          >
            {canDelete
              ? "✓ Confirmación escrita correctamente. Ya puedes eliminar."
              : confirmationText.length > 0
              ? "Aún no coincide. Escribe la palabra exactamente como se muestra."
              : "Este paso ayuda a prevenir eliminaciones accidentales."}
          </p>
        </div>

        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <strong>Recomendación:</strong> revisa que realmente deseas eliminar
          este elemento antes de continuar.
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="
              w-full
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
            Volver sin eliminar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canDelete || isDeleting}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-700
              px-5
              py-3
              text-sm
              font-bold
              text-white
              shadow-md
              transition-colors
              hover:bg-red-800
              focus:outline-none
              focus:ring-4
              focus:ring-red-200
              disabled:cursor-not-allowed
              disabled:bg-red-300
              sm:w-auto
            "
          >
            {isDeleting && (
              <span
                className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"
                aria-hidden="true"
              />
            )}
            {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
