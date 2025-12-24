import React from "react";
import { PARTNERSHIP_LEVELS, PartnershipLevel } from "../config/partnership";

type Props = {
  level: PartnershipLevel;
};

const glowFor = (level: PartnershipLevel) => {
  switch (level) {
    case "L3":
      return "0 0 18px rgba(0,255,255,0.55)";
    case "L2":
      return "0 0 16px rgba(0,255,255,0.45)";
    case "L1":
      return "0 0 14px rgba(0,255,255,0.35)";
    default:
      return "0 0 10px rgba(0,255,255,0.25)";
  }
};

const PartnershipBadge: React.FC<Props> = ({ level }) => {
  const discount = PARTNERSHIP_LEVELS[level].discount;

  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 14,
        border: "1px solid rgba(0,255,255,0.25)",
        background: "rgba(5,10,20,0.55)",
        boxShadow: glowFor(level),
        color: "rgba(0,255,255,0.95)",
        fontWeight: 800,
      }}
    >
      Partnership {level} ({discount}%)
    </div>
  );
};

export default PartnershipBadge;

