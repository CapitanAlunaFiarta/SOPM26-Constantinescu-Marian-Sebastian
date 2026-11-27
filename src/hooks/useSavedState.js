import { useState, useEffect } from "react";

function readStored(storageKey, initialValue, validate) {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === null) return initialValue;
    const parsed = JSON.parse(saved);
    if (validate && !validate(parsed)) return initialValue;
    return parsed;
  } catch {
    return initialValue;
  }
}

export function useSavedState(storageKey, initialValue, validate) {
  const [value, setValue] = useState(() => readStored(storageKey, initialValue, validate));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (err) {
      console.error("Eroare salvare localStorage:", err);
    }
  }, [storageKey, value]);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== storageKey || event.storageArea !== localStorage) return;
      if (event.newValue === null) {
        setValue(initialValue);
        return;
      }
      try {
        const parsed = JSON.parse(event.newValue);
        if (!validate || validate(parsed)) setValue(parsed);
      } catch {
        return;
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey, initialValue, validate]);

  return [value, setValue];
}
