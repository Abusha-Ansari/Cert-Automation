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
  const [sheetName, setSheetName] = useState('');
  const [eventName, setEventName] = useState('');
  const [tempFolderId, setTempFolderId] = useState('');
  const [slideTemplateId, setSlideTemplateId] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');

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

      const urlParams = new URLSearchParams(window.location.search);
      const sheet = urlParams.get("sheet");
      const event = urlParams.get("event");
      const tempFolder = urlParams.get("tempFolder");
      const slideTemplate = urlParams.get("slideTemplate");
      const sheetId = urlParams.get("sheetId");

      if (sheet) setSheetName(sheet);
      if (event) setEventName(event);
      if (tempFolder) setTempFolderId(tempFolder);
      if (slideTemplate) setSlideTemplateId(slideTemplate);
      if (sheetId) setSpreadsheetId(sheetId);
      
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
      body: JSON.stringify({ token, "sheet_name": sheetName, "event_name": eventName, "temp_folder_id": tempFolderId, "slide_template_id": slideTemplateId, "sheet_ID": spreadsheetId, delete_old: true }),
    });
    const result = await res.json();
    setLoading((l) => ({ ...l, create: false }));
    if (!res.ok || result.error) return alert(`❌ ${result.error}`);
    alert("✅ Certificates created!");
  };

  const handleSend = async () => {
    if (!loggedIn) return alert("Please authorize with Google first");
    setLoading((l) => ({ ...l, send: true }));

    if (!sheetName || !eventName) {
      return alert("Please provide both sheet name and event name in the URL parameters.");
    }
    console.log("Sending certificates for sheet:", sheetName, "and event:", eventName);

    const res = await fetch("/api/send-certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, "sheet_name": sheetName, "event_name": eventName, "sheet_ID": spreadsheetId }),
    });

    const result = await res.json();
    setLoading((l) => ({ ...l, send: false }));

    if (!res.ok || result.error) return alert(`❌ ${result.error}`);
    alert("✅ Certificates sent!");
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
          onClick={() => {
            if (window.confirm("Are you sure you want to CREATE certificates?")) {
              handleCreate();
            }
          }}
          loading={loading.create}
          disabled={!loggedIn}
          label="Create Certificates"
        />
        <ActionButton
          onClick={() => {
            if(window.confirm("Are you sure you want to SEND certificates?")) {
              handleSend();
            }
          }}
          loading={loading.send}
          disabled={!loggedIn}
          label="Send Certificates"
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
