import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { addPropertyControls, ControlType } from "framer";
import { motion, AnimatePresence } from "framer-motion";
export function PreLoaderConnector(props) {
  const { duration = 3, connectedFrame } = props;
  const [isVisible, setIsVisible] = React.useState(true);
  React.useEffect(() => {
    // Валидация duration
    const safeDuration = Math.max(0.1, Math.min(10, Number(duration) || 3));
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, safeDuration * 1e3);
    return () => clearTimeout(timer);
  }, [duration]);
  const containerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    background: "transparent",
  };
  const frameWrapperStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  const frameStyle = { width: "100%", height: "100%", objectFit: "cover" };
  const safeFrames = Array.isArray(connectedFrame) ? connectedFrame : [];
  const hasFrames = safeFrames.length > 0;
  return /*#__PURE__*/ _jsx(AnimatePresence, {
    children:
      isVisible &&
      /*#__PURE__*/ _jsx(motion.div, {
        initial: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0 } },
        style: containerStyle,
        children:
          hasFrames &&
          safeFrames.map((frame, index) => {
            if (!(/*#__PURE__*/ React.isValidElement(frame))) {
              console.warn(
                `PreLoaderConnector: Invalid frame at index ${index}`
              );
              return null;
            }
            return /*#__PURE__*/ _jsx(
              "div",
              {
                style: frameWrapperStyle,
                children: /*#__PURE__*/ React.cloneElement(frame, {
                  style: frameStyle,
                }),
              },
              `frame-${index}`
            );
          }),
      }),
  });
}
addPropertyControls(PreLoaderConnector, {
  duration: {
    type: ControlType.Number,
    title: "Duration",
    defaultValue: 3,
    min: 1,
    max: 10,
    unit: "s",
    step: 0.1,
    displayStepper: true,
  },
  connectedFrame: {
    type: ControlType.Array,
    title: "Connect Frame",
    propertyControl: { type: ControlType.ComponentInstance },
  },
});
export const __FramerMetadata__ = {
  exports: {
    PreLoaderConnector: {
      type: "reactComponent",
      name: "PreLoaderConnector",
      slots: [],
      annotations: { framerContractVersion: "1" },
    },
    __FramerMetadata__: { type: "variable" },
  },
};
//# sourceMappingURL=./PreloaderConnector.map
