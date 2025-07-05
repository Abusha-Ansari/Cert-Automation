"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { Users, Award, FileText, Send } from "lucide-react";
import Image from "next/image";

const COLORS = {
  bg: "#060a12",
  textPrimary: "#FFFFFF",
  textSecondary: "#CCD6F6",
  accent: "#0d192f",
  cardBg: "#000000",
  border: "#121823",
  button: "#0A192F",
  error: "#FF4040",
};

const layoutStyle: React.CSSProperties = {
  backgroundColor: COLORS.bg,
  minHeight: "100vh",
  padding: "1.5rem",
  fontFamily: "sans-serif",
  color: COLORS.textPrimary,
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  padding: "0.5rem",
  alignItems: "flex-start",
  justifyContent: "space-between",
};

const mainContentStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "1.5rem",
  width: "100%",
};

const statGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "1rem",
};

const buttonStyle = (disabled = false): React.CSSProperties => ({
  padding: "0.875rem 1.5rem",
  backgroundColor: COLORS.button,
  color: COLORS.textPrimary,
  border: "none",
  borderRadius: "0.5rem",
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: 600,
  fontSize: "0.875rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  opacity: disabled ? 0.6 : 1,
  transition: "all 0.2s ease",
  width: "100%",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
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
    style={{
      ...buttonStyle(disabled || loading),
      transform: "translateY(0)",
    }}
    onMouseEnter={(e) => {
      if (!disabled && !loading) {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(88, 226, 197, 0.3)";
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    }}
  >
    {loading ? (
      "Processing..."
    ) : (
      <>
        <Icon
          style={{
            color: COLORS.textPrimary,
            width: "1.125rem",
            height: "1.125rem",
          }}
        />
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
      backgroundColor: COLORS.cardBg,
      border: `1px solid ${COLORS.border}`,
      borderRadius: "0.75rem",
      padding: "1.25rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transition: "all 0.2s ease",
      minHeight: "100px",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.borderColor = COLORS.textSecondary;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.borderColor = COLORS.border;
    }}
  >
    <div>
      <p
        style={{
          color: COLORS.textSecondary,
          fontSize: "0.75rem",
          marginBottom: "0.5rem",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontWeight: 500,
        }}
      >
        {title}
      </p>
      <p style={{ fontSize: "1.5rem", fontWeight: "bold", lineHeight: "1.2" }}>
        {value}
      </p>
    </div>
    <div
      style={{
        backgroundColor: "rgba(88, 226, 197, 0.1)",
        borderRadius: "50%",
        width: "2.5rem",
        height: "2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon
        style={{
          color: COLORS.textSecondary,
          width: "1.25rem",
          height: "1.25rem",
        }}
      />
    </div>
  </div>
);

const spinnerStyle: React.CSSProperties = {
  width: "3rem",
  height: "3rem",
  border: "4px solid #ccc",
  borderTop: "4px solid #6366F1", // Indigo color for accent
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface TokenData {
  accessToken: string;
  refreshToken: string;
  loggedIn: boolean;
}

// import { useEffect, useState } from "react";

export default function CertificateDashboard() {
  const [state, setState] = useState({
    loggedIn: false,
    token: null as TokenData | null,
    sheetName: "",
    eventName: "",
    tempFolderId: "",
    slideTemplateId: "",
    spreadsheetId: "",
  });

  const [loading, setLoading] = useState({ create: false, send: false });
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [totalCreated, settotalCreated] = useState<number>(0);
  const [totalSent, setTotalSent] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      try {
        const authRes = await fetch("/api/auth/status");
        const authData = await authRes.json();

        const urlParams = new URLSearchParams(window.location.search);

        const sheetName = urlParams.get("sheet") || "";
        const eventName = urlParams.get("event") || "";
        const tempFolderId = urlParams.get("tempFolder") || "";
        const slideTemplateId = urlParams.get("slideTemplate") || "";
        const spreadsheetId = urlParams.get("sheetId") || "";

        const allParamsExist =
          sheetName &&
          eventName &&
          tempFolderId &&
          slideTemplateId &&
          spreadsheetId;

        if (!allParamsExist) {
          alert(
            "❗ Please provide all required parameters in the URL."
          );
          return;
        }

        setState({
          loggedIn: authData.loggedIn,
          token: authData,
          sheetName,
          eventName,
          tempFolderId,
          slideTemplateId,
          spreadsheetId,
        });

        if(!authData.loggedIn) { setTotalParticipants(0); return; }

        const res = await fetch("/api/get-sheet-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: authData,
            sheet_name: sheetName,
            event_name: eventName,
            temp_folder_id: tempFolderId,
            slide_template_id: slideTemplateId,
            sheet_ID: spreadsheetId,
            delete_old: true,
          }),
        });

        const result = await res.json();

        if (!res.ok || result.error) {
          console.error("Error fetching sheet data:", result.error);
          alert("Failed to fetch participant data.");
          return;
        }

        setTotalParticipants(result.data.length - 1);
      } catch (error) {
        console.error("Initialization failed:", error);
        alert("An error occurred during initialization.");
      }
    };

    init();
  }, []);

  if (!totalParticipants) {
    return (
      <div
        style={{
          ...layoutStyle,
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        {/* Inject keyframes */}
        <style>{spinKeyframes}</style>

        <div style={spinnerStyle}></div>
        <h2 style={{ marginTop: "1rem", color: "#9CA3AF" /* text-gray-400 */ }}>
          Loading & fetching sheet data...
        </h2>
      </div>
    );
  }

  const startAuth = () => (window.location.href = "/api/auth/start");

  const handleCreate = async () => {
    if (!state.loggedIn) return alert("Please authorize with Google first");
    setLoading((l) => ({ ...l, create: true }));
    const res = await fetch("/api/create-certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: state.token,
        sheet_name: state.sheetName,
        event_name: state.eventName,
        temp_folder_id: state.tempFolderId,
        slide_template_id: state.slideTemplateId,
        sheet_ID: state.spreadsheetId,
        delete_old: true,
      }),
    });
    const result = await res.json();
    setLoading((l) => ({ ...l, create: false }));
    if (!res.ok || result.error) return alert(`❌ ${result.error}`);
    settotalCreated(totalParticipants);
    alert("✅ Certificates created!");
  };

  const handleSend = async () => {
    if (!state.loggedIn) return alert("Please authorize with Google first");
    setLoading((l) => ({ ...l, send: true }));
    const res = await fetch("/api/send-certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: state.token,
        sheet_name: state.sheetName,
        event_name: state.eventName,
        sheet_ID: state.spreadsheetId,
      }),
    });
    const result = await res.json();
    setLoading((l) => ({ ...l, send: false }));
    if (!res.ok || result.error) return alert(`❌ ${result.error}`);
    setTotalSent(totalParticipants);
    alert("✅ Certificates sent!");
  };

  return (
    <div style={layoutStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            width: "100%",
          }}
        >
          <Image
            src="/csi-pce-logo.png"
            alt="Company Logo"
            width={88} // 5.5rem ≈ 88px
            height={88}
            style={{ borderRadius: "0.5rem", objectFit: "cover" }}
          />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
              Certificate Automation
            </h1>
            <p
              style={{
                color: COLORS.textSecondary,
                marginTop: "0.25rem",
                fontSize: "0.875rem",
              }}
            >
              Automate generation and delivery
            </p>
          </div>

          <div>
            {!state.loggedIn ? (
              <button
                style={buttonStyle()}
                onClick={startAuth}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(88, 226, 197, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
                }}
              >
                Connect Google Account
              </button>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "rgba(220, 149, 8, 0.1)",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "0.5rem",
                  border: `1px solid ${COLORS.border}`,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "0.5rem",
                    height: "0.5rem",
                    borderRadius: "50%",
                    backgroundColor: COLORS.textSecondary,
                  }}
                />
                <span style={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                  Connected
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Info Card */}
      <div
        style={{
          backgroundColor: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "0.75rem",
          padding: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(88, 226, 197, 0.1)",
            borderRadius: "0.75rem",
            padding: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FileText
            style={{
              color: COLORS.textSecondary,
              width: "1.5rem",
              height: "1.5rem",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
            {state.eventName || "Code Clash 2023"}
          </h2>
          <p
            style={{
              color: COLORS.textSecondary,
              fontSize: "0.875rem",
              marginTop: "0.25rem",
            }}
          >
            {state.sheetName || "Hackathon Event"}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div style={statGridStyle}>
        <StatCard
          title="Total Participants"
          value={totalParticipants}
          icon={Users}
        />
        <StatCard
          title="Certificates Created"
          value={totalCreated}
          icon={Award}
        />
        <StatCard title="Certificates Sent" value={totalSent} icon={Send} />
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* Actions Section */}
        <div
          style={{
            backgroundColor: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: "0.75rem",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ color: COLORS.textSecondary }}>▹</span> Certificate
            Actions
          </h2>

          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {/* Generate Certificates */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <Award
                  style={{
                    color: COLORS.textSecondary,
                    width: "1.25rem",
                    height: "1.25rem",
                  }}
                />
                <h3
                  style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}
                >
                  Generate Certificates
                </h3>
              </div>
              <p
                style={{
                  color: COLORS.textSecondary,
                  fontSize: "0.875rem",
                  lineHeight: "1.6",
                  marginBottom: "1.5rem",
                }}
              >
                Creates certificates for all participants using your Google
                Slides template. This process will generate personalized
                certificates based on the participant data in your spreadsheet.
              </p>
              <ActionButton
                onClick={() =>
                  window.confirm(
                    "Generate certificates for all participants?"
                  ) && handleCreate()
                }
                loading={loading.create}
                disabled={!state.loggedIn}
                label="Generate Certificates"
                icon={Award}
              />
            </div>
            <style>{`
            button {
              border: 1.5px solid #181e2f !important;
            }
          `}</style>

            {/* Send Certificates */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <Send
                  style={{
                    color: COLORS.textSecondary,
                    width: "1.25rem",
                    height: "1.25rem",
                  }}
                />
                <h3
                  style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}
                >
                  Send Certificates
                </h3>
              </div>
              <p
                style={{
                  color: COLORS.textSecondary,
                  fontSize: "0.875rem",
                  lineHeight: "1.6",
                  marginBottom: "1.5rem",
                }}
              >
                Emails the generated certificates to each participant in your
                spreadsheet. Make sure all certificates are generated before
                sending them out.
              </p>
              <ActionButton
                onClick={() =>
                  window.confirm("Send certificates to all participants?") &&
                  handleSend()
                }
                loading={loading.send}
                disabled={!state.loggedIn}
                label="Send Certificates"
                icon={Send}
              />
            </div>
          </div>

          {/* Not Connected Warning */}
          {!state.loggedIn && (
            <div
              style={{
                backgroundColor: "#2B1C1C",
                border: `1px solid ${COLORS.error}`,
                borderRadius: "0.5rem",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  backgroundColor: COLORS.error,
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <p
                style={{
                  color: COLORS.error,
                  fontSize: "0.875rem",
                  margin: 0,
                  lineHeight: "1.4",
                }}
              >
                Please connect your Google account to enable certificate
                actions.
              </p>
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          // marginTop: "2rem",
          textAlign: "center",
          color: COLORS.textSecondary,
          fontSize: "0.85rem",
          opacity: 0.7,
          letterSpacing: "0.5px",
        }}
      >
        Owned and Managed by CSI-PCE
      </div>
    </div>
  );
}
