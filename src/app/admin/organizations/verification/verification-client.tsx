"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable,
  AdminBadge,
  AdminEmptyState
} from "@/components/admin/ui";
import { OrgDetailDrawer } from "@/components/admin/drawers";
import { approveOrganization, rejectOrganization } from "@/app/admin/actions";
import { toast } from "sonner";
import {
  Building,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrganizationRecord {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  verification_status: string;
  is_suspended: boolean;
  created_at: string;
  owner_name: string;
  owner_email: string;
  events_count: number;
}

export function VerificationClient({ initialOrgs }: { initialOrgs: OrganizationRecord[] }) {
  const [orgs, setOrgs] = useState<OrganizationRecord[]>(initialOrgs);
  const [activeDrawerId, setActiveDrawerId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleVerify = (id: string) => {
    startTransition(async () => {
      try {
        await approveOrganization(id);
        setOrgs(prev => prev.filter(o => o.id !== id));
        toast.success("Organization approved and verified");
      } catch (err: any) {
        toast.error(err.message || "Failed to verify organization");
      }
    });
  };

  const handleReject = (id: string) => {
    if (!confirm("Are you sure you want to reject this organization's verification request?")) return;
    startTransition(async () => {
      try {
        await rejectOrganization(id);
        setOrgs(prev => prev.filter(o => o.id !== id));
        toast.success("Verification request rejected");
      } catch (err: any) {
        toast.error(err.message || "Failed to reject organization");
      }
    });
  };

  return (
    <div className="space-y-8 font-sans">
      <AdminHeader
        title="Host Verifications"
        description="Audit pending host applications to grant verification trust badges"
      />

      {orgs.length === 0 ? (
        <AdminEmptyState
          title="All clear! No pending verifications"
          description="Every active organization on Eventic has been moderated."
          icon={Building}
        />
      ) : (
        <div className="relative">
          <AdminTable headers={["Organization details", "Owner info", "Events Hosted", "Status", "Review Actions"]}>
            {orgs.map((org) => (
              <tr key={org.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-xs text-white">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-extrabold text-white block text-sm leading-none mb-1">{org.name}</span>
                      <span className="text-xs text-neutral-500 block">slug: {org.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-xs">
                  <span className="block text-white font-bold">{org.owner_name}</span>
                  <span className="block text-neutral-500 text-[10px] mt-0.5">{org.owner_email}</span>
                </td>
                <td className="p-4 text-xs text-white font-bold">
                  {org.events_count} events
                </td>
                <td className="p-4 text-xs">
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Pending</span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setActiveDrawerId(org.id)}
                      className="text-neutral-400 hover:text-white cursor-pointer size-8"
                      title="View Profile Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleVerify(org.id)}
                      className="bg-white text-black hover:bg-neutral-200 text-xs font-bold gap-1 cursor-pointer h-8 rounded-lg"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleReject(org.id)}
                      className="bg-neutral-900 border border-neutral-800 text-red-400 hover:bg-neutral-850 text-xs font-bold gap-1 cursor-pointer h-8 rounded-lg"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>
      )}

      <OrgDetailDrawer
        orgId={activeDrawerId}
        isOpen={!!activeDrawerId}
        onClose={() => setActiveDrawerId(null)}
      />
    </div>
  );
}
