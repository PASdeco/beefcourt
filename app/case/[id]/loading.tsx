import { Skeleton } from "@/components/EmptyState";

export default function CaseLoading() {
  return (
    <div className="wrap">
      <div className="case-page">
        <div className="page-head">
          <Skeleton lines={2} />
        </div>
        <div className="case-layout">
          <div className="case-main">
            <Skeleton lines={6} />
            <Skeleton lines={8} />
          </div>
          <div className="case-side">
            <Skeleton lines={4} />
          </div>
        </div>
      </div>
    </div>
  );
}
