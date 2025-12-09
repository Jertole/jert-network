
import React from "react";
import { Layout } from "./components/Layout";
import { MultisigDashboard } from "./components/MultisigDashboard";

export const App: React.FC = () => {
  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <MultisigDashboard />
      </div>
    </Layout>
  );
};
