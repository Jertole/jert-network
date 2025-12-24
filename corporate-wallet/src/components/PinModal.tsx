import React, { useState } from "react";
import { isPinSet, savePin, validatePin } from "../security/pinStorage";

interface PinModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export const PinModal: React.FC<PinModalProps> = ({ open, onClose, onSuccess }) => {
  const [mode, setMode] = useState<"enter" | "create">(isPinSet() ? "enter" : "create");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pinTrim = pin.trim();

    if (mode === "create") {
      try {
        setBusy(true);
        savePin(pinTrim);
        await onSuccess();
        onClose();
      } catch (e: any) {
        setError(e?.message ?? "Failed to save PIN");
      } finally {
        setBusy(false);
      }
      return;
    }

    // mode === "enter"
    if (!validatePin(pinTrim)) {
      setError("Invalid PIN");
      return;
    }

    try {
      setBusy(true);
      await onSuccess();
      onClose();
    } catch (e: any) {
      // If onSuccess throws (e.g., send failed), keep modal open and show error
      setError(e?.message ?? "Operation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: 320,
          borderRadius: 16,
          padding: 20,
          background: "#05050a",
          border: "1px solid #333",
          color: "#f5f5f5",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>
          {mode === "create" ? "Create security PIN" : "Enter security PIN"}
        </h3>
        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 0 }}>
          This PIN protects JERT transfers in this browser.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={8}
            inputMode="numeric"
            autoFocus
            disabled={busy}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#0b0b12",
              color: "#f5f5f5",
              fontSize: 16,
              textAlign: "center",
              letterSpacing: 4,
              marginTop: 8,
              marginBottom: 10,
              opacity: busy ? 0.7 : 1,
            }}
          />

          {error && (
            <p style={{ color: "#ff6b6b", fontSize: 12, marginTop: 0 }}>
              {error}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid #444",
                background: "transparent",
                color: "#f5f5f5",
                fontSize: 12,
                opacity: busy ? 0.7 : 1,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={busy}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(90deg,#00e5ff,#00ff9d,#b000ff)",
                color: "#000",
                fontSize: 12,
                fontWeight: 600,
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? "Working..." : mode === "create" ? "Save PIN" : "Confirm"}
            </button>
          </div>
        </form>

        {isPinSet() && mode === "enter" && (
          <button
            onClick={() => {
              setMode("create");
              setPin("");
              setError(null);
            }}
            disabled={busy}
            style={{
              marginTop: 8,
              background: "none",
              border: "none",
              color: "#888",
              fontSize: 11,
              textDecoration: "underline",
              cursor: busy ? "default" : "pointer",
              opacity: busy ? 0.7 : 1,
            }}
          >
            Reset PIN
          </button>
        )}
      </div>
    </div>
  );
};

