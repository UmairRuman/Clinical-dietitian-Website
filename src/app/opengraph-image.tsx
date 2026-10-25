import { ImageResponse } from "next/og";

export const alt = "Dn. Bushra Naseem, Clinical Dietitian";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Shown when the site is shared on WhatsApp, Facebook, Instagram or Google.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 90px", background: "linear-gradient(135deg, #f3faf3, #cfe9d4)", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 8, textTransform: "uppercase", color: "#2f6b45" }}>Clinical Dietitian</div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 104, fontWeight: 700, color: "#173a26", lineHeight: 1.02 }}>Dn. Bushra Naseem</div>
        <div style={{ display: "flex", marginTop: 26, fontSize: 44, color: "#2f6b45", fontStyle: "italic" }}>Achieve Your Wellness Goals</div>
        <div style={{ display: "flex", marginTop: 44 }}>
          <div style={{ display: "flex", padding: "16px 34px", borderRadius: 999, background: "#a8d8b0", color: "#173a26", fontSize: 28, fontWeight: 700, letterSpacing: 3 }}>BOOK A SESSION</div>
        </div>
      </div>
    ),
    size,
  );
}
