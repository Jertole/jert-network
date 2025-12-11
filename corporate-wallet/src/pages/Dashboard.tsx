
import React from "react";
import { JertBalance } from "../components/JertBalance";
import { SendJert } from "../components/SendJert";
import { MultisigOverview } from "../components/MultisigOverview";

export const Dashboard: React.FC = () => {
  return (
    <div
      id="dashboard-root"
      style={{
        minHeight: "100vh",
        padding: "24px 16px 40px",
        background: "#020308",
        color: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Верхняя панель с заголовком и слоганом */}
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              JERT Corporate Wallet
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                opacity: 0.7,
              }}
            >
              Treasury balance, token transfers and multisig overview.
            </p>
          </div>

          <div
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #222",
              background:
                "linear-gradient(90deg, rgba(0,229,255,0.12), rgba(0,255,157,0.12), rgba(176,0,255,0.14))",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1,
              whiteSpace: "nowrap",
            }}
          >
            Building the Green Cold Energy Network across Eurasia
          </div>
        </div>
      </header>

      {/* Основная сетка */}
      <main
        style={{
          display: "grid",
          gap: 24,
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1.2fr)",
        }}
      >
        {/* Левая колонка: баланс + отправка */}
        <section
          aria-label="Balance and transfers"
          style={{
            display: "grid",
            gap: 20,
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: 16,
                fontWeight: 600,
                opacity: 0.9,
              }}
            >
              Treasury & token balance
            </h2>
            <JertBalance />
          </div>

          <div>
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: 16,
                fontWeight: 600,
                opacity: 0.9,
              }}
            >
              Send JERT
            </h2>
            <SendJert />
          </div>
        </section>

        {/* Правая колонка: мультисиг */}
        <section
          aria-label="Multisig overview"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: 16,
              fontWeight: 600,
              opacity: 0.9,
            }}
          >
            Treasury multisig status
          </h2>
          <MultisigOverview />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
