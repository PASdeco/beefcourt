import { ImageResponse } from "next/og";
import { getCase } from "@/lib/contract";
import { caseNumber, statusLabel } from "@/lib/format";

export const alt = "Beef Court case";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let title = "Beef Court";
  let label = "Settle it. For good.";
  let meta = "Independent AI validators on GenLayer";
  try {
    const data = await getCase(Number(id));
    title = data.title;
    label = caseNumber(data.id);
    meta = `${data.plaintiff_name} vs ${data.defendant_name || "an open seat"} · ${statusLabel(
      data.status,
    )} · ${data.stake} credit stake`;
  } catch {
    // Fall back to the generic card if StudioNet is unavailable.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#150A0E",
          color: "#F7F4F1",
          padding: "64px 72px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 82% 18%, rgba(214,170,88,0.22), transparent 46%), radial-gradient(circle at 12% 92%, rgba(163,33,61,0.28), transparent 48%)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "#D6AA58",
              color: "#150A0E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            BC
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.3 }}>Beef Court</span>
            <span style={{ fontSize: 17, color: "#B9A9AE" }}>{label}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <span
            style={{
              fontSize: 20,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#D6AA58",
              marginBottom: 18,
            }}
          >
            On the docket
          </span>
          <div
            style={{
              fontSize: title.length > 56 ? 54 : 68,
              lineHeight: 1.04,
              fontWeight: 800,
              letterSpacing: -2,
              display: "flex",
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontSize: 24, color: "#D8C9CC", maxWidth: 800 }}>{meta}</span>
          <span style={{ fontSize: 22, color: "#D6AA58", fontWeight: 700 }}>beefcourt.xyz</span>
        </div>
      </div>
    ),
    size,
  );
}
