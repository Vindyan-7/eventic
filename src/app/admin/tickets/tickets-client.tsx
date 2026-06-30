"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable,
  AdminBadge,
  AdminEmptyState
} from "@/components/admin/ui";
import { TicketDetailDrawer } from "@/components/admin/drawers";
import { cancelTicket } from "@/app/admin/actions";
import { exportToCSV } from "@/lib/admin/export";
import { toast } from "sonner";
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Download,
  Ban,
  Eye,
  Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TicketRecord {
  id: string;
  ticket_number: string;
  created_at: string;
  attendee_name: string;
  attendee_email: string;
  event_title: string;
  organization_name: string;
  payment_status: string;
  amount: number;
}

export function TicketsClient({ initialTickets }: { initialTickets: TicketRecord[] }) {
  const [tickets, setTickets] = useState<TicketRecord[]>(initialTickets);

  // States
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "free" | "pending" | "refunded">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDrawerId, setActiveDrawerId] = useState<string | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredTickets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTickets.map(t => t.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Individual Actions
  const handleCancelTicket = (id: string) => {
    if (!confirm("Are you sure you want to cancel and delete this ticket registration? This will revoke access.")) return;
    startTransition(async () => {
      try {
        await cancelTicket(id);
        setTickets(prev => prev.filter(t => t.id !== id));
        setSelectedIds(prev => prev.filter(x => x !== id));
        toast.success("Ticket registration cancelled");
      } catch (err: any) {
        toast.error(err.message || "Failed to cancel ticket");
      }
    });
  };

  // Bulk Actions
  const handleBulkCancel = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to cancel the ${selectedIds.length} selected tickets?`)) return;
    startTransition(async () => {
      try {
        for (const id of selectedIds) {
          await cancelTicket(id);
        }
        setTickets(prev => prev.filter(t => !selectedIds.includes(t.id)));
        toast.success(`Successfully cancelled ${selectedIds.length} tickets`);
        setSelectedIds([]);
      } catch {
        toast.error("Bulk cancellation failed");
      }
    });
  };

  const handleBulkExport = () => {
    const dataToExport = filteredTickets.map(t => ({
      RegistrationID: t.id,
      TicketNumber: t.ticket_number,
      AttendeeName: t.attendee_name,
      AttendeeEmail: t.attendee_email,
      Event: t.event_title,
      Organization: t.organization_name,
      PaymentStatus: t.payment_status,
      PaidAmount: t.amount,
      RegisteredAt: new Date(t.created_at).toLocaleString()
    }));
    exportToCSV(dataToExport, "tickets");
    toast.success("Exported current tickets list to CSV");
  };

  // Filter & Sort
  const filteredTickets = tickets
    .filter(t => {
      const matchSearch =
        t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
        t.attendee_name.toLowerCase().includes(search.toLowerCase()) ||
        t.attendee_email.toLowerCase().includes(search.toLowerCase()) ||
        t.event_title.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase());

      const matchPayment =
        paymentFilter === "all" ||
        t.payment_status === paymentFilter ||
        (paymentFilter === "free" && t.payment_status === "free");

      return matchSearch && matchPayment;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return 0;
    });

  return (
    <div className="space-y-8 font-sans">
      <AdminHeader
        title="Tickets Management"
        description="Verify event admissions, manage ticket transfers, and cancel registrations"
        actions={
          <Button
            onClick={handleBulkExport}
            disabled={filteredTickets.length === 0}
            className="h-10 px-4 rounded-xl text-xs bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      {/* Filter and Control actions panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-neutral-950 p-4 rounded-2xl border border-neutral-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by ticket #, email, or attendee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-neutral-500" />
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
            >
              <option value="all">All Payment States</option>
              <option value="free">Free Registrations</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-neutral-500" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
          >
            <option value="newest">Sort: Latest Purchased</option>
            <option value="oldest">Sort: Oldest Purchased</option>
          </select>
        </div>
      </div>

      {/* Bulk action selection bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 bg-neutral-900/40 p-4 border border-neutral-850 rounded-2xl animate-in slide-in-from-top-1 text-xs justify-between">
          <div className="text-neutral-300 font-bold">
            {selectedIds.length} tickets selected
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBulkCancel}
              disabled={isPending}
              className="h-8 px-3 rounded-lg text-xs bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/60 gap-1.5 cursor-pointer"
            >
              <Ban className="h-3.5 w-3.5" /> Cancel Selected
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setSelectedIds([])}
              className="text-neutral-400 hover:text-white"
            >
              Clear selection
            </Button>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <AdminEmptyState
          title="No tickets match current filters"
          description="Refine your active search parameters or filters."
          icon={Ticket}
        />
      ) : (
        <div className="relative">
          <AdminTable headers={["", "Ticket Number", "Attendee Info", "Event Name", "Host Org", "Payment State", "Registered At", ""]}>
            {filteredTickets.map((t) => {
              const isSelected = selectedIds.includes(t.id);
              return (
                <tr key={t.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
                  <td className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(t.id)}
                      className="rounded border-neutral-800 bg-neutral-950 text-white accent-white cursor-pointer h-4 w-4"
                    />
                  </td>
                  <td className="p-4 font-mono text-xs font-bold text-white">
                    {t.ticket_number}
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="font-extrabold text-white block text-sm leading-none mb-1">{t.attendee_name}</span>
                      <span className="text-xs text-neutral-500 block">{t.attendee_email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-neutral-300 font-bold">
                    {t.event_title}
                  </td>
                  <td className="p-4 text-xs text-neutral-500">
                    {t.organization_name}
                  </td>
                  <td className="p-4 text-xs">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-white">
                      {t.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-neutral-500">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 relative">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setActiveDrawerId(t.id)}
                        className="text-neutral-400 hover:text-white cursor-pointer size-8"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setActiveActionMenuId(activeActionMenuId === t.id ? null : t.id)}
                        className="text-neutral-400 hover:text-white cursor-pointer size-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {activeActionMenuId === t.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveActionMenuId(null)} />
                          <div className="absolute right-4 top-12 z-20 w-44 rounded-xl border border-neutral-850 bg-neutral-950 p-1.5 shadow-xl animate-in fade-in duration-200">
                            <button
                              onClick={() => { handleCancelTicket(t.id); setActiveActionMenuId(null); }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-950/20 flex items-center gap-2 cursor-pointer"
                            >
                              <Ban className="h-3.5 w-3.5" /> Cancel Ticket
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </AdminTable>
        </div>
      )}

      {/* Details drawer sheet */}
      <TicketDetailDrawer
        regId={activeDrawerId}
        isOpen={!!activeDrawerId}
        onClose={() => setActiveDrawerId(null)}
      />
    </div>
  );
}
