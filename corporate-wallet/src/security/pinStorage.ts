const PIN_KEY = "jert_pin";

export function isPinSet(): boolean {
  return typeof localStorage !== "undefined" && !!localStorage.getItem(PIN_KEY);
}

export function savePin(pin: string) {
  if (pin.length < 4) throw new Error("PIN must be at least 4 digits");
  localStorage.setItem(PIN_KEY, pin);
}

export function validatePin(pin: string): boolean {
  if (typeof localStorage === "undefined") return false;
  const stored = localStorage.getItem(PIN_KEY);
  return !!stored && stored === pin;
}
