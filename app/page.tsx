"use client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface TokenData {
  accessToken: string;
  refreshToken: string;
  loggedIn: boolean;
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState<TokenData | null>(null);

  const [loading, setLoading] = useState({
    upload: false,
    create: false,
    send: false,
  });

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        setLoggedIn(data.loggedIn);
        setToken(data);
      })
      .catch(() => setLoggedIn(false));
  }, []);

  const startAuth = () => {
    window.location.href = "/api/auth/start";
  };

  const handleCreate = async () => {
    if (!loggedIn) return alert("Please authorize with Google first");
    setLoading((l) => ({ ...l, create: true }));
    const res = await fetch("/api/create-certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
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
      body: JSON.stringify({ token }),
    });
    const result = await res.json();
    setLoading((l) => ({ ...l, send: false }));
    if (!res.ok || result.error) return alert(`❌ ${result.error}`);
    alert("✅ Certificates sent!");
  };

  const handleUpload = async () => {
    if (!loggedIn) return alert("Please authorize with Google first");
    setLoading((l) => ({ ...l, upload: true }));

    const sampleData = [
      {
        Name: "Abusha",
        Email: "soulknight130@gmail.com",
        Date: "2025-06-17",
        Description: "completed the event",
        "Slide ID": "",
        Status: "",
      },
      {
        Name: "Shreyash",
        Email: "shreyashbansod72@gmail.com",
        Date: "2025-06-17",
        Description: "abusha ne bheja hai",
        "Slide ID": "",
        Status: "",
      },
      {
        Name: "Purva",
        Email: "purvakokate07@gmail.com",
        Date: "2025-06-17",
        Description: "testing certificate",
        "Slide ID": "",
        Status: "",
      },
    ];

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: sampleData }),
    });

    const result = await res.json();
    setLoading((l) => ({ ...l, upload: false }));
    if (!res.ok || result.error) return alert(`❌ ${result.error}`);
    alert("✅ Uploaded to Google Sheet!");
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white px-6 py-10 flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎓 Certificate Automation</h1>
        <p className="text-sm text-muted-foreground">
          Authorize with Google to create, upload, and send certificates.
        </p>
      </div>

      {!loggedIn ? (
        <button
          onClick={startAuth}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow"
        >
          Authorize with Google
        </button>
      ) : (
        <p className="text-green-600 font-medium">✅ Authorized</p>
      )}

      <div className="flex flex-col gap-4 w-full max-w-sm mt-4">
        <ActionButton
          onClick={handleCreate}
          loading={loading.create}
          disabled={!loggedIn}
          label="Create Certificates"
        />
        <ActionButton
          onClick={handleSend}
          loading={loading.send}
          disabled={!loggedIn}
          label="Send Certificates"
        />
        <ActionButton
          onClick={handleUpload}
          loading={loading.upload}
          disabled={!loggedIn}
          label="Upload to Google Sheet"
        />
      </div>
    </main>
  );
}

function ActionButton({
  onClick,
  loading,
  disabled,
  label,
}: {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg shadow text-sm font-semibold transition ${
        disabled
          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
          : "bg-indigo-600 hover:bg-indigo-700 text-white"
      }`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {label}
    </button>
  );
}
