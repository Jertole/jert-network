import React from "react";
import { Layout } from "./components/Layout";
import { MultisigDashboard } from "./components/MultisigDashboard";
import { TransactionsTable } from "./components/TransactionsTable";

export const App: React.FC = () => {
  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <MultisigDashboard />
        <TransactionsTable />
      </div>
    </Layout>
  );
};
