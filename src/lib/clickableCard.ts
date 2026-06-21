import type { KeyboardEvent } from "react";

export function clickableCardProps(onActivate: () => void) {
  return {
    role: "button" as const,
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onActivate();
      }
    },
  };
}

export function stopCardActionBubble(event: {
  stopPropagation: () => void;
}) {
  event.stopPropagation();
}
