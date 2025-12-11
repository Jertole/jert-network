import React from "react";
import { JertBalance } from "../components/JertBalance";

export const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      {/* Остальной UI */}
      <JertBalance />
    </div>
  );
};
