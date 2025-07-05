"use client";
import React, { useEffect, useState } from "react";
import { Users, Award, FileText, Send } from "lucide-react";

const COLORS = {
  bg: "#0A192F",
  textPrimary: "#FFFFFF",
  textSecondary: "#CCD6F6",
  accent: "#58E2C5",
  cardBg: "#112240", // slightly lighter than bg
  border: "#233554",
  error: "#FF4040",
};

const layoutStyle: React.CSSProperties = {
  backgroundColor: COLORS.bg,
  minHeight: "100vh",
  padding: "0 40px 40px 40px", 
  fontFamily: "sans-serif",
  color: COLORS.textPrimary,
};


const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "40px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
};

const statGridStyle: React.CSSProperties = {
  display: "flex",
  gap: "24px",
  flexWrap: "wrap",
  marginBottom: "40px",
};

const buttonStyle = (disabled = false): React.CSSProperties => ({
  padding: "12px 20px",
  backgroundColor: COLORS.accent,
  color: COLORS.bg,
  border: "none",
  borderRadius: "8px",
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: 600,
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  opacity: disabled ? 0.6 : 1,
  transition: "transform 0.2s",
});

type ActionButtonProps = {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  label: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
};

const ActionButton = ({
  onClick,
  loading,
  disabled,
  label,
  icon: Icon,
}: ActionButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    style={buttonStyle(disabled || loading)}
  >
    {loading ? (
      "Processing..."
    ) : (
      <>
        <Icon style={{ color: COLORS.bg }} />
        {label}
      </>
    )}
  </button>
);

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
};

const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
  <div
    style={{
      ...cardStyle,
      flex: "1 1 200px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <div>
      <p
        style={{
          color: COLORS.textSecondary,
          fontSize: "12px",
          marginBottom: "4px",
        }}
      >
        {title}
      </p>
      <p style={{ fontSize: "24px", fontWeight: "bold" }}>{value}</p>
    </div>
    <Icon style={{ color: COLORS.accent, width: 28, height: 28 }} />
  </div>
);

interface TokenData {
  accessToken: string;
  refreshToken: string;
  loggedIn: boolean;
}

export default function CertificateDashboard() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState<TokenData | null>(null);
  const [sheetName, setSheetName] = useState("");
  const [eventName, setEventName] = useState("");
  const [tempFolderId, setTempFolderId] = useState("");
  const [slideTemplateId, setSlideTemplateId] = useState("");
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [loading, setLoading] = useState({ create: false, send: false });

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        setLoggedIn(data.loggedIn);
        setToken(data);
      })
      .catch(() => setLoggedIn(false));

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("sheet")) setSheetName(urlParams.get("sheet") || "");
    if (urlParams.get("event")) setEventName(urlParams.get("event") || "");
    if (urlParams.get("tempFolder"))
      setTempFolderId(urlParams.get("tempFolder") || "");
    if (urlParams.get("slideTemplate"))
      setSlideTemplateId(urlParams.get("slideTemplate") || "");
    if (urlParams.get("sheetId"))
      setSpreadsheetId(urlParams.get("sheetId") || "");
  }, []);

  const startAuth = () => (window.location.href = "/api/auth/start");

  const handleCreate = async () => {
    if (!loggedIn) return alert("Please authorize with Google first");
    setLoading((l) => ({ ...l, create: true }));
    const res = await fetch("/api/create-certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        sheet_name: sheetName,
        event_name: eventName,
        temp_folder_id: tempFolderId,
        slide_template_id: slideTemplateId,
        sheet_ID: spreadsheetId,
        delete_old: true,
      }),
    });
    const result = await res.json();
    setLoading((l) => ({ ...l, create: false }));
    if (!res.ok || result.error) return alert(`❌ ${result.error}`);
    alert("✅ Certificates created!");
  };

  const handleSend = async () => {
    if (!loggedIn) return alert("Please authorize with Google first");
    setLoading((l) => ({ ...l, send: true }));
    const res = await fetch("/api/send-certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        sheet_name: sheetName,
        event_name: eventName,
        sheet_ID: spreadsheetId,
      }),
    });
    const result = await res.json();
    setLoading((l) => ({ ...l, send: false }));
    if (!res.ok || result.error) return alert(`❌ ${result.error}`);
    alert("✅ Certificates sent!");
  };

  return (
    <div style={layoutStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/csi-pce-logo.png" // Replace with the actual filename
            alt="Company Logo"
            style={{ width: 150, height: 150, borderRadius: 6 }}
          />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>
              Certificate Automation
            </h1>
            <p style={{ color: COLORS.textSecondary, marginTop: 6 }}>
              Automate generation and delivery
            </p>
          </div>
        </div>
        <div>
          {!loggedIn ? (
            <button style={buttonStyle()} onClick={startAuth}>
              Connect Google Account
            </button>
          ) : (
            <p style={{ color: COLORS.accent, fontWeight: "bold" }}>
              ✅ Connected
            </p>
          )}
        </div>
      </div>

      {/* Event Info Card */}
      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <FileText style={{ color: COLORS.accent, width: 32, height: 32 }} />
          <div>
            <h2 style={{ fontSize: 20, fontWeight: "bold" }}>
              Code Clash 2023
            </h2>
            <p style={{ color: COLORS.textSecondary, fontSize: 14 }}>
              Hackathon Event
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={statGridStyle}>
        <StatCard title="Total Participants" value="247" icon={Users} />
        <StatCard title="Certificates Created" value="156" icon={Award} />
        <StatCard title="Certificates Sent" value="89" icon={Send} />
      </div>

      {/* Actions */}
      <div
        style={{
          ...cardStyle,
          width: "100%",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: 32,
          backgroundColor: "#122341", // slightly more contrast
        }}
      >
        {/* Header */}
        {/* <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <h3 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
      🛠️ Certificate Actions
    </h3>
    <p style={{ color: COLORS.textSecondary, fontSize: 14, maxWidth: 600 }}>
      These tools let you generate and email certificates for your participants.
      Make sure your sheet and template IDs are configured correctly.
    </p>
  </div> */}

        {/* Action Row */}
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {/* Generate Certificates */}
          <div
            style={{
              flex: "1 1 320px",
              minWidth: 280,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Award style={{ color: COLORS.accent, width: 20, height: 20 }} />
              <h3 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
                Generate Certificates
              </h3>
            </div>
            <p
              style={{
                color: COLORS.textSecondary,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Creates certificates for all participants using your Google Slides
              template.
            </p>
            <ActionButton
              onClick={() =>
                window.confirm("Generate certificates for all participants?") &&
                handleCreate()
              }
              loading={loading.create}
              disabled={!loggedIn}
              label="Generate"
              icon={Award}
            />
          </div>

          {/* Send Certificates */}
          <div
            style={{
              flex: "1 1 320px",
              minWidth: 280,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Send style={{ color: COLORS.accent, width: 20, height: 20 }} />
              <h3 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
                Send Certificates
              </h3>
            </div>
            <p
              style={{
                color: COLORS.textSecondary,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Emails the generated certificates to each participant in your
              spreadsheet.
            </p>
            <ActionButton
              onClick={() =>
                window.confirm("Send certificates to all participants?") &&
                handleSend()
              }
              loading={loading.send}
              disabled={!loggedIn}
              label="Send"
              icon={Send}
            />
          </div>
        </div>

        {/* Not Connected Warning */}
        {!loggedIn && (
          <div
            style={{
              backgroundColor: "#2B1C1C",
              border: `1px solid ${COLORS.error}`,
              borderRadius: 10,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
            }}
          >
            <span
              style={{
                backgroundColor: COLORS.error,
                width: 10,
                height: 10,
                borderRadius: "50%",
              }}
            />
            <p style={{ color: COLORS.error, fontSize: 13, margin: 0 }}>
              Please connect your Google account to enable these actions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
