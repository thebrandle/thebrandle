import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { addPropertyControls, ControlType } from "framer";
export function Counter({
  start = 0,
  end = 100,
  speed = 100,
  gapSize = 4,
  prefixText = "",
  suffixText = "",
  prefixFont,
  suffixFont,
  prefixColor,
  suffixColor,
  loop = false,
  decimalSeparatorType = "comma",
  textSize = 36,
  selectedFont = { fontFamily: "Inter", fontWeight: 500, systemFont: true },
  textColor = "#D3D3D3",
  startOnViewport = false,
  restartOnViewport = false,
  incrementType = "integer",
}) {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!(isVisible || !startOnViewport) || start === end) return;
    const increment = incrementType === "integer" ? 1 : 0.1;
    const intervalId = setInterval(() => {
      setCount((prev) =>
        prev + increment >= end
          ? end
          : parseFloat((prev + increment).toFixed(2))
      );
    }, speed);
    return () => clearInterval(intervalId);
  }, [isVisible, start, end, speed, startOnViewport, incrementType]);
  useEffect(() => {
    if (restartOnViewport && isVisible) setCount(start);
  }, [isVisible, restartOnViewport, start]);
  const formatNumber = (number) => {
    if (decimalSeparatorType === "comma") return number.toLocaleString("en-US");
    if (decimalSeparatorType === "period")
      return number.toLocaleString("en-US").replace(/,/g, ".");
    return number.toFixed(incrementType === "integer" ? 0 : 1);
  };
  return /*#__PURE__*/ _jsxs(motion.div, {
    ref: containerRef,
    style: {
      display: "flex",
      gap: `${gapSize}px`,
      alignItems: "center",
      fontSize: `${textSize}px`,
      fontFamily: selectedFont.fontFamily,
      fontWeight: selectedFont.fontWeight,
      color: textColor,
      letterSpacing: "-0.07em",
    },
    children: [
      prefixText &&
        /*#__PURE__*/ _jsx("span", {
          style: {
            fontFamily: prefixFont?.fontFamily,
            fontWeight: prefixFont?.fontWeight,
            color: prefixColor,
          },
          children: prefixText,
        }),
      /*#__PURE__*/ _jsx("span", { children: formatNumber(count) }),
      suffixText &&
        /*#__PURE__*/ _jsx("span", {
          style: {
            fontFamily: suffixFont?.fontFamily,
            fontWeight: suffixFont?.fontWeight,
            color: suffixColor,
          },
          children: suffixText,
        }),
    ],
  });
}
addPropertyControls(Counter, {
  startOnViewport: {
    type: ControlType.Boolean,
    title: "Viewport",
    defaultValue: false,
  },
  restartOnViewport: {
    type: ControlType.Boolean,
    title: "Replay",
    defaultValue: false,
  },
  selectedFont: {
    title: "Font",
    type: ControlType.Font,
    defaultValue: { fontFamily: "Inter", fontWeight: 500, systemFont: true },
  },
  textSize: {
    title: "Font Size",
    type: ControlType.Number,
    min: 8,
    max: 240,
    step: 1,
  },
  textColor: { type: ControlType.Color, title: "Font Color" },
  start: { type: ControlType.Number, title: "Start Number", defaultValue: 0 },
  end: { type: ControlType.Number, title: "End Number", defaultValue: 10 },
  decimalSeparatorType: {
    type: ControlType.Enum,
    title: "Separator",
    defaultValue: "comma",
    options: ["comma", "period", "none"],
  },
  incrementType: {
    type: ControlType.Enum,
    title: "Increment Type",
    defaultValue: "integer",
    options: ["integer", "decimal"],
  },
  prefixText: { type: ControlType.String, title: "Prefix", defaultValue: "" },
  prefixFont: { title: "Prefix Font", type: ControlType.Font },
  prefixColor: { type: ControlType.Color, title: "Prefix Color" },
  suffixText: { type: ControlType.String, title: "Suffix", defaultValue: "" },
  suffixFont: { title: "Suffix Font", type: ControlType.Font },
  suffixColor: { type: ControlType.Color, title: "Suffix Color" },
  gapSize: {
    type: ControlType.Number,
    title: "Gap Size",
    defaultValue: 4,
    min: 0,
    max: 100,
  },
  speed: {
    type: ControlType.Number,
    title: "Speed (ms)",
    defaultValue: 100,
    min: 0,
    max: 2e3,
  },
  loop: {
    type: ControlType.Boolean,
    title: "Loop Animation",
    defaultValue: false,
  },
});
export const __FramerMetadata__ = {
  exports: {
    Counter: {
      type: "reactComponent",
      name: "Counter",
      slots: [],
      annotations: { framerContractVersion: "1" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./Counter.map
