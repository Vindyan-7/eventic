"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable,
  AdminEmptyState
} from "@/components/admin/ui";
import { dismissReport, resolveReport } from "@/app/admin/actions";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportRecord {
  id: string;
  reported_item_type: string;
  reported_item_id: string;
  reporter_name: string;
  reporter_email: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
}

export function ReportsClient({ initialReports }: { initialReports: ReportRecord[] }) {
  const [reports, setReports] = useState<ReportRecord[]>(initialReports);
  const [activeReport, setActiveReport] = useState<ReportRecord | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDismiss = (id: string) => {
    startTransition(async () => {
      try {
        await dismissReport(id);
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: "dismissed" } : r));
        toast.success("Report dismissed successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to dismiss report");
      }
    });
  };

  const handleResolve = (id: string) => {
    startTransition(async () => {
      try {
        await resolveReport(id);
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" } : r));
        toast.success("Report resolved successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to resolve report");
      }
    });
  };

  return (
    <div className="space-y-8 font-sans">
      <AdminHeader
        title="Abuse Reports Log"
        description="Review reports filed by users against events, organizations, or member profiles"
      />

      {reports.length === 0 ? (
        <AdminEmptyState
          title="No reports flagged"
          description="Congratulations! No platform violations or abuse reports have been logged."
          icon={Flag}
        />
      ) : (
        <div className="relative">
          <AdminTable headers={["Reported Item", "Reporter", "Reason", "Created", "Status", "Review Actions"]}>
            {reports.map((r) => (
              <tr key={r.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
                <td className="p-4">
                  <span className="font-extrabold text-white block text-sm leading-none mb-1 capitalize">{r.reported_item_type}</span>
                  <span className="text-[10px] text-neutral-500 font-mono block">{r.reported_item_id}</span>
                </td>
                <td className="p-4 text-xs">
                  <span className="block text-white font-bold">{r.reporter_name}</span>
                  <span className="block text-neutral-500 text-[10px] mt-0.5">{r.reporter_email}</span>
                </td>
                <td className="p-4 text-xs text-white font-bold">
                  {r.reason}
                </td>
                <td className="p-4 text-xs text-neutral-400">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="p-4 text-xs uppercase tracking-wider font-bold">
                  {r.status === "pending" ? (
                    <span className="text-amber-400">Pending</span>
                  ) : r.status === "resolved" ? (
                    <span className="text-emerald-400">Resolved</span>
                  ) : (
                    <span className="text-neutral-500">{r.status}</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setActiveReport(r)}
                      className="text-neutral-400 hover:text-white cursor-pointer size-8"
                      title="View Description"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {r.status === "pending" && (
                      <>
                        <Button
                          size="xs"
                          onClick={() => handleResolve(r.id)}
                          className="bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 hover:bg-emerald-950/60 text-xs font-bold gap-1 cursor-pointer rounded-lg px-2 h-8"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Resolve
                        </Button>
                        <Button
                          size="xs"
                          onClick={() => handleDismiss(r.id)}
                          className="bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/60 text-xs font-bold gap-1 cursor-pointer rounded-lg px-2 h-8"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>
      )}

      {/* View report overlay */}
      {activeReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3 text-sm">
              <h3 className="font-extrabold text-white">Report Context Details</h3>
              <Button variant="ghost" size="xs" onClick={() => setActiveReport(null)} className="text-neutral-500 hover:text-white">Close</Button>
            </div>
            <div className="space-y-3 text-xs font-sans">
              <div>
                <span className="text-neutral-500 font-bold block uppercase tracking-wider text-[9px] mb-1">Target type</span>
                <span className="text-white capitalize">{activeReport.reported_item_type} ({activeReport.reported_item_id})</span>
              </div>
              <div>
                <span className="text-neutral-500 font-bold block uppercase tracking-wider text-[9px] mb-1">Reporter</span>
                <span className="text-white">{activeReport.reporter_name} ({activeReport.reporter_email})</span>
              </div>
              <div>
                <span className="text-neutral-500 font-bold block uppercase tracking-wider text-[9px] mb-1">Flagged Reason</span>
                <span className="text-white font-bold">{activeReport.reason}</span>
              </div>
              <div>
                <span className="text-neutral-500 font-bold block uppercase tracking-wider text-[9px] mb-1">Elaboration Description</span>
                <p className="bg-neutral-900 border border-neutral-850 p-3 rounded-xl text-neutral-300 whitespace-pre-wrap leading-relaxed mt-1">
                  {activeReport.description || "No additional text supplied."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
