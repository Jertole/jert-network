import React, { useEffect, useMemo, useState } from "react";
import PartnershipBadge from "./PartnershipBadge";
import {
  DEFAULT_PARTNERSHIP_LEVEL,
  PartnershipLevel,
  PARTNERSHIP_LEVELS,
} from "../config/partnership";
import { DEFAULT_JERT_PRICE_USD, DEFAULT_MW_PER_JERT } from "../config/pricing";
import JertoleLogo from "../assets/jertole-logo.png";

/* ----------------------------- helpers ----------------------------- */

const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
};

/* ----------------------------- component ---------------------------- */

export default function HeaderBar() {
  const [level, setLevel] = useState<PartnershipLevel>(
    DEFAULT_PARTNERSHIP_LEVEL
  );

  const discount = useMemo(
    () => PARTNERSHIP_LEVELS[level]?.discount ?? 0,
    [level]
  );

  const isMobile = useIsMobile(720);

  /* ----------------------------- styles ----------------------------- */

  const containerStyle: React.CSSProperties = {
    padding: isMobile ? 14 : 18,
    borderRadius: isMobile ? 16 : 20,
    border: "1px solid rgba(0,255,255,0.18)",
    background:
      "linear-gradient(180deg, rgba(5,10,20,0.86), rgba(2,6,12,0.72))",
    boxShadow: "0 0 26px rgba(0,255,255,0.14)",
    boxSizing: "border-box",
    width: "100%",
    overflow: "hidden", // ✅ nothing can spill outside the window
  };

  // Desktop: 3 columns | Mobile: stacked
  const layoutStyle: React.CSSProperties = isMobile
    ? {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        textAlign: "center",
        width: "100%",
      }
    : {
        display: "grid",
        gridTemplateColumns:
          "minmax(0, 1fr) minmax(240px, 1.2fr) minmax(0, 1fr)", // ✅ minmax(0,...) prevents overflow
        alignItems: "center",
        gap: 14,
        width: "100%",
      };

  const logoWrapStyle: React.CSSProperties = isMobile
    ? { display: "flex", justifyContent: "center", width: "100%", minWidth: 0 }
    : {
        display: "flex",
        justifyContent: "flex-start",
        width: "100%",
        minWidth: 0,
        paddingLeft: 18, // small shift to the right; keep modest for desktop
      };

  const centerStyle: React.CSSProperties = {
    fontFamily: "monospace",
    lineHeight: 1.15,
    textAlign: "center",
    minWidth: 0,
  };

  // ✅ Key: keep everything inside; allow wrap; don't exceed container width
  const rightStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: isMobile ? "center" : "flex-end",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    overflow: "hidden",
  };

  const selectStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(0,255,255,0.18)",
    background: "rgba(0,0,0,0.35)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
    maxWidth: "100%",
  };

  const discountStyle: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.72,
    whiteSpace: "nowrap", // ✅ keep “Discount: 25%” on one line
    maxWidth: "100%",
  };

  /* ------------------------------ JSX ------------------------------- */

  return (
    <div style={containerStyle}>
      <div style={layoutStyle}>
        {/* LEFT: LOGO */}
        <div style={logoWrapStyle}>
          <img
            src={JertoleLogo}
            alt="JERTÓLE"
            draggable={false}
            style={{
              height: isMobile ? 76 : 80,
              width: "auto",
              display: "block",
              objectFit: "contain",
              filter: "drop-shadow(0 0 14px rgba(0,255,255,0.45))",
            }}
          />
        </div>

        {/* CENTER: PRICE */}
        <div style={centerStyle}>
          <div style={{ fontSize: 12, opacity: 0.78 }}>JERT Price</div>

          <div
            style={{
              fontSize: isMobile ? 22 : 20,
              fontWeight: 900,
              letterSpacing: 0.6,
              color: "rgba(0,255,255,0.96)",
              textShadow: "0 0 14px rgba(0,255,255,0.35)",
              marginTop: 2,
            }}
          >
            {"$" + DEFAULT_JERT_PRICE_USD.toFixed(2)}
          </div>

          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
            JERT ={" "}
            <span style={{ color: "rgba(0,255,255,0.92)", fontWeight: 900 }}>
              {DEFAULT_MW_PER_JERT.toFixed(3)}
            </span>{" "}
            MW cold energy
          </div>
        </div>

        {/* RIGHT: PARTNERSHIP */}
        <div style={rightStyle}>
          <PartnershipBadge level={level} />

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as PartnershipLevel)}
            style={selectStyle}
          >
            <option value="L0">L0 (0%)</option>
            <option value="L1">L1 (25%)</option>
            <option value="L2">L2 (50%)</option>
            <option value="L3">L3 (75%)</option>
          </select>

          {!isMobile && (
            <div style={discountStyle}>
              Discount:{" "}
              <span
                style={{
                  color: "rgba(0,255,255,0.92)",
                  fontWeight: 900,
                }}
              >
                {discount}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

