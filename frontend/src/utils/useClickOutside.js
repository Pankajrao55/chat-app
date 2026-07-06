import { useEffect } from "react";

// Closes a popover/dropdown when the user clicks anywhere outside the given
// ref(s). Pass a single ref, or an array of refs when the trigger button and
// the floating menu aren't nested inside each other (e.g. a fixed-position dropdown).
export const useClickOutside = (refs, onOutsideClick, active) => {
  useEffect(() => {
    if (!active) return;
    const refList = Array.isArray(refs) ? refs : [refs];
    const handleClick = (e) => {
      const isInside = refList.some((ref) => ref.current && ref.current.contains(e.target));
      if (!isInside) onOutsideClick();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [active, refs, onOutsideClick]);
};
