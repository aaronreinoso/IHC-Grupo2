import React, { useEffect, useState } from "react";

type ToastType = "success" | "error" | "warning";

interface ToastProps {
  message: string;
  onClose: () => void;
  type?: ToastType;
}

const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  type,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const detectedType: ToastType = type
    ? type
    : message.startsWith("Error")
    ? "error"
    : message.startsWith("⚠️") ||
      message.startsWith("Advertencia") ||
      message.startsWith("Límite")
    ? "warning"
    : "success";

  const toastStyles = {
    success: {
      border: "border-emerald-300",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-700",
      text: "text-gray-800",
      closeFocus: "focus:ring-emerald-300",
    },
    error: {
      border: "border-red-300",
      iconBg: "bg-red-100",
      iconText: "text-red-700",
      text: "text-gray-800",
      closeFocus: "focus:ring-red-300",
    },
    warning: {
      border: "border-amber-300",
      iconBg: "bg-amber-100",
      iconText: "text-amber-700",
      text: "text-gray-800",
      closeFocus: "focus:ring-amber-300",
    },
  };

  const currentStyle = toastStyles[detectedType];

  useEffect(() => {
    if (message) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const closeToast = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50
        flex items-start
        w-[calc(100%-2rem)]
        max-w-sm
        p-4
        gap-3
        bg-white
        border
        rounded-xl
        shadow-2xl
        transition-all
        duration-300
        transform
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        ${currentStyle.border}
      `}
      role={detectedType === "error" ? "alert" : "status"}
      aria-live={detectedType === "error" ? "assertive" : "polite"}
    >
      <div
        className={`
          inline-flex
          items-center
          justify-center
          flex-shrink-0
          w-10
          h-10
          rounded-lg
          ${currentStyle.iconBg}
          ${currentStyle.iconText}
        `}
        aria-hidden="true"
      >
        {detectedType === "error" && (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}

        {detectedType === "success" && (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}

        {detectedType === "warning" && (
          <svg
            className="w-6 h-6"
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
        )}
      </div>

      <div className={`flex-1 pt-1 text-sm font-semibold leading-5 ${currentStyle.text}`}>
        {message}
      </div>

      <button
        type="button"
        onClick={closeToast}
        className={`
          ml-auto
          -mr-1
          -mt-1
          bg-white
          text-gray-500
          hover:text-gray-900
          rounded-lg
          focus:outline-none
          focus:ring-2
          ${currentStyle.closeFocus}
          p-1.5
          hover:bg-gray-100
          inline-flex
          h-8
          w-8
        `}
        aria-label="Cerrar notificación"
      >
        <span className="sr-only">Cerrar</span>
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default Toast;