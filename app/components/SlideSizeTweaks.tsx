"use client";

import { useEffect } from "react";
import { Pane } from "tweakpane";

const PARAMS = {
  spacingRem: 1,
  maxWidthVw: 85,
  maxWidthPx: 960,
  maxHeightVh: 70,
  maxHeightPx: 640,
};

function applySlideVars() {
  const root = document.documentElement;
  root.style.setProperty("--slide-spacing", `${PARAMS.spacingRem}rem`);
  root.style.setProperty(
    "--slide-max-width",
    `min(${PARAMS.maxWidthVw}vw, ${PARAMS.maxWidthPx}px)`,
  );
  root.style.setProperty(
    "--slide-max-height",
    `min(${PARAMS.maxHeightVh}vh, ${PARAMS.maxHeightPx}px)`,
  );
  window.dispatchEvent(new Event("slide-size-vars"));
}

export default function SlideSizeTweaks() {
  useEffect(() => {
    const pane = new Pane({
      title: "Slide size",
      expanded: true,
    });

    const root = pane.element;
    root.style.position = "fixed";
    root.style.top = "16px";
    root.style.right = "16px";
    root.style.zIndex = "9999";

    const spacing = pane.addFolder({ title: "Gap / spacing" });
    spacing
      .addBinding(PARAMS, "spacingRem", {
        label: "spacing (rem)",
        min: 0,
        max: 4,
        step: 0.05,
      })
      .on("change", applySlideVars);

    const width = pane.addFolder({ title: "Max width" });
    width
      .addBinding(PARAMS, "maxWidthVw", {
        label: "vw",
        min: 20,
        max: 100,
        step: 1,
      })
      .on("change", applySlideVars);
    width
      .addBinding(PARAMS, "maxWidthPx", {
        label: "px",
        min: 200,
        max: 1600,
        step: 10,
      })
      .on("change", applySlideVars);

    const height = pane.addFolder({ title: "Max height" });
    height
      .addBinding(PARAMS, "maxHeightVh", {
        label: "vh",
        min: 20,
        max: 100,
        step: 1,
      })
      .on("change", applySlideVars);
    height
      .addBinding(PARAMS, "maxHeightPx", {
        label: "px",
        min: 120,
        max: 1200,
        step: 10,
      })
      .on("change", applySlideVars);

    pane
      .addButton({ title: "Reset" })
      .on("click", () => {
        PARAMS.spacingRem = 1;
        PARAMS.maxWidthVw = 85;
        PARAMS.maxWidthPx = 960;
        PARAMS.maxHeightVh = 70;
        PARAMS.maxHeightPx = 640;
        pane.refresh();
        applySlideVars();
      });

    applySlideVars();

    return () => {
      pane.dispose();
    };
  }, []);

  return null;
}
