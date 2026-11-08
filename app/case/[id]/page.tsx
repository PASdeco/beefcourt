import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CaseDetail } from "@/components/CaseDetail";
import { getCase } from "@/lib/contract";
import type { DisputeCase } from "@/lib/types";
import { caseNumber, truncate } from "@/lib/format";

export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: raw } = await params;
  const id = parseId(raw);
  if (!id) return { title: "Case not found" };
  try {
    const data = await getCase(id);
    const title = `${caseNumber(data.id)} — ${data.title}`;
    return {
      title,
      description: truncate(
        `${data.plaintiff_name} vs ${data.defendant_name || "an open seat"}: ${data.plaintiff_statement}`,
        155,
      ),
      alternates: { canonical: `/case/${data.id}` },
      openGraph: {
        title,
        type: "article",
        images: [{ url: `/case/${data.id}/opengraph-image`, width: 1200, height: 630 }],
      },
      twitter: {
        title,
        card: "summary_large_image",
        images: [`/case/${data.id}/opengraph-image`],
      },
    };
  } catch {
    return { title: `Case ${raw}` };
  }
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = parseId(raw);
  if (!id) notFound();

  let caseData: DisputeCase;
  try {
    caseData = await getCase(id);
  } catch {
    return (
      <div className="wrap">
        <div className="case-page">
          <div className="empty-state">
            <span className="empty-seal" aria-hidden="true">
              !
            </span>
            <h3>The court is being rebuilt</h3>
            <p>This case could not be loaded from StudioNet right now. The docket itself is safe.</p>
            <Link className="btn brass" href="/verdicts">
              Back to the docket
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <CaseDetail initialCase={caseData} />;
}
