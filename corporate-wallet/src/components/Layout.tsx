
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#05070b",
        color: "#f5f5f5",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      <header
        style={{
          padding: "16px 32px",
          borderBottom: "1px solid rgba(0,229,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(90deg, #05070b 0%, #06121e 50%, #05070b 100%)"
        }}
