"use client";
import { useState, useEffect } from "react";

interface TokenData {
  accessToken: string;
  refreshToken: string;
  loggedIn: Boolean;
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState<TokenData | null>(null);
  useEffect(() => {
    // Optionally ping an API to check if token exists
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        setLoggedIn(data.loggedIn);
        setToken(data);
        console.log('Logged in:', data.loggedIn);
        console.log('Data:', data);
        // console.log('Access Token:', data.accessToken);
      })
      .catch(() => setLoggedIn(false));
  }, []);

  const startAuth = () => {
    window.location.href = "/api/auth/start";
  };

  const handleCreate = async () => {
    if (!loggedIn) {
      alert("Please authorize with Google first");
      return;
    }
    const data = await fetch("/api/create-certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!data.ok) {
      const error = await data.json();
      alert(`Error creating certificates: ${error.message}`);
      return;
    }
    const result = await data.json();
    console.log("Certificates created:", result);
    if (result.error) {
      alert(`Error creating certificates: ${result.error}`);
      return;
    }
    console.log("Certificates created successfully:", result);
    setLoggedIn(true);
    alert("Created successfully!");
  };

  const handleSend = async () => {
    if (!loggedIn) {
      alert("Please authorize with Google first");
      return;
    }
    const data = await fetch("/api/send-certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!data.ok) {
      const error = await data.json();
      alert(`Error sending certificates: ${error.message}`);
      return;
    }
    const result = await data.json();
    console.log("Certificates sent:", result);
    if (result.error) {
      alert(`Error sending certificates: ${result.error}`);
      return;
    }
    console.log("Certificates sent successfully:", result);
    setLoggedIn(true);
    console.log("Certificates sent successfully!");
    alert("Sent successfully!");
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Certificate Automation (OAuth)</h1>

      {!loggedIn && <button onClick={startAuth}>Authorize with Google</button>}
      <br />
      <br />

      <button onClick={handleCreate} disabled={!loggedIn}>
        Create Certificates
      </button>
      <br />
      <br />

      <button onClick={handleSend} disabled={!loggedIn}>
        Send Certificates
      </button>
    </main>
  );
}
