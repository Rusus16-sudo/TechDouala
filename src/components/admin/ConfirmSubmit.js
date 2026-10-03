"use client";

import { useFormStatus } from "react-dom";

/** Bouton d'envoi qui demande une confirmation (actions irréversibles : annulation, suppression). */
export default function ConfirmSubmit({ message, className, children }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}
