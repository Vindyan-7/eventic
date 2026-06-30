"use client";

import { useState } from "react";
import { createPlatformAPIKey, revokePlatformAPIKey } from "@/app/admin/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Key, Plus, Trash2, Copy, CheckCircle, ShieldAlert } from "lucide-react";

interface APIKeyRecord {
  id: string;
  name: string;
  key_hint: string;
  permissions: string[];
  last_used_at: string | null;
  created_at: string;
}

export function APIKeysClient({ initialKeys }: { initialKeys: APIKeyRecord[] }) {
  const [keys, setKeys] = useState<APIKeyRecord[]>(initialKeys);
  const [newName, setNewName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Show key value once created
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const availablePermissions = [
    { key: "read.users", label: "Read User Accounts" },
    { key: "write.users", label: "Modify User Roles" },
    { key: "read.events", label: "Read Event Listings" },
    { key: "write.events", label: "Publish Events" },
    { key: "scanner.verify", label: "Verify Scanner Keys" }
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission scope");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await createPlatformAPIKey({
        name: newName,
        permissions: selectedPermissions
      });
      if (res.success && res.key) {
        setCreatedKey(res.key);
        toast.success("API Key generated successfully");
        setNewName("");
        setSelectedPermissions([]);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create API key");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API credential key? Outgoing client scripts will immediately fail.")) return;
    try {
      await revokePlatformAPIKey(id);
      setKeys(prev => prev.filter(k => k.id !== id));
      toast.success("API key credential revoked successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke key");
    }
  };

  const handleCopy = () => {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey);
    toast.success("API Key copied to clipboard");
  };

  const togglePermission = (key: string) => {
    setSelectedPermissions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      <div className="border-b border-neutral-900 pb-4">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Key className="h-5 w-5 text-neutral-400" /> Administrative API Keys
        </h2>
        <p className="text-[10px] text-neutral-500 font-bold mt-0.5">Manage authentication credentials and permissions for third-party integrations</p>
      </div>

      {/* Show newly created key in a warning banner */}
      {createdKey && (
        <div className="bg-amber-950/20 border border-amber-900/50 p-5 rounded-3xl space-y-3 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>Copy Your API Key Now</span>
          </div>
          <p className="text-neutral-400 text-[10px] font-bold">This key will not be displayed again for security reasons. Store it in a secure password vault.</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={createdKey}
              className="flex-1 h-10 px-3 rounded-xl border border-neutral-850 bg-black font-mono text-[11px] text-white outline-none"
            />
            <Button
              onClick={handleCopy}
              className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-10 px-3.5"
            >
              <Copy className="h-4 w-4" /> Copy Key
            </Button>
            <Button
              onClick={() => { setCreatedKey(null); window.location.reload(); }}
              className="bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-850 font-extrabold rounded-xl h-10 px-3.5"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Create Key Form */}
      <form onSubmit={handleCreate} className="space-y-4 border border-neutral-900 bg-neutral-900/10 p-5 rounded-3xl text-xs">
        <h3 className="font-extrabold text-white text-[10px] uppercase tracking-wider text-neutral-400">Generate New API Key</h3>
        <div className="space-y-2">
          <label className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block">Credential Name / Label</label>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Analytics Platform Client"
            className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block">Permission Scopes</label>
          <div className="flex flex-wrap gap-3">
            {availablePermissions.map(p => {
              const isChecked = selectedPermissions.includes(p.key);
              return (
                <button
                  type="button"
                  key={p.key}
                  onClick={() => togglePermission(p.key)}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    isChecked
                      ? "bg-white text-black border-white"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-9 px-3.5 text-xs mt-2"
        >
          <Plus className="h-4 w-4" /> {isSubmitting ? "Generating..." : "Generate Key"}
        </Button>
      </form>

      {/* Keys Table List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-white text-[10px] uppercase tracking-wider text-neutral-400">Active API Keys</h3>
        {keys.length === 0 ? (
          <p className="text-xs text-neutral-500 italic py-6">No active API credentials found.</p>
        ) : (
          <div className="border border-neutral-900 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3 pl-4">Key Label</th>
                  <th className="p-3">Hint</th>
                  <th className="p-3">Scopes</th>
                  <th className="p-3">Last Active</th>
                  <th className="p-3 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-neutral-900/10">
                    <td className="p-3 pl-4 font-bold text-white">
                      {k.name}
                    </td>
                    <td className="p-3 font-mono text-neutral-400">
                      {k.key_hint}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {k.permissions.map((p, idx) => (
                          <span key={idx} className="bg-neutral-900 px-2 py-0.5 rounded text-[10px] text-neutral-400 font-mono font-bold">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-neutral-400">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "Never"}
                    </td>
                    <td className="p-3 text-right pr-4">
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="bg-red-950/20 hover:bg-red-950/50 text-red-400 font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-red-900/50 transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
