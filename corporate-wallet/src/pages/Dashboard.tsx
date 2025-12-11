
import React from "react";
import { JertBalance } from "../components/JertBalance";
import { SendJert } from "../components/SendJert";

export const Dashboard: React.FC = () => {
  return (
    <div id="dashboard-root" style={{ padding: 24, display: "grid", gap: 24 }}>
      <JertBalance />
      <SendJert />
    </div>
  );
};
