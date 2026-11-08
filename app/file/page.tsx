import { Suspense } from "react";
import type { Metadata } from "next";
import { FileCaseForm } from "@/components/FileCaseForm";
import { Skeleton } from "@/components/EmptyState";

export const metadata: Metadata = {
  title: "File a case",
  description: "Put your beef on the record and let independent AI validators settle it.",
  alternates: { canonical: "/file" },
};

export default function FilePage() {
  return (
    <div className="wrap">
      <Suspense
        fallback={
          <div className="page-head">
            <h1>File a case</h1>
            <Skeleton lines={8} />
          </div>
        }
      >
        <FileCaseForm />
      </Suspense>
    </div>
  );
}
