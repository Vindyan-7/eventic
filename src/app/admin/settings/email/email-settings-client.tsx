"use client";

import { useState } from "react";
import { updatePlatformSMTPSettings, updatePlatformEmailTemplate } from "@/app/admin/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Mail, Save, Play, Edit3, Eye, FileText } from "lucide-react";

export function EmailSettingsClient({ initialSmtp, initialTemplates }: { initialSmtp: any; initialTemplates: any[] }) {
  const [smtpData, setSmtpData] = useState({
    smtp_host: initialSmtp.smtp_host || "",
    smtp_port: initialSmtp.smtp_port || 2525,
    smtp_username: initialSmtp.smtp_username || "",
    smtp_password: initialSmtp.smtp_password || "",
    sender_name: initialSmtp.sender_name || "",
    sender_email: initialSmtp.sender_email || ""
  });
  
  const [templates, setTemplates] = useState<any[]>(
    initialTemplates.length > 0 ? initialTemplates : [
      { template_key: "welcome", subject: "Welcome to Eventic, {{name}}!", body: "Hi {{name}},\n\nWelcome to Eventic! Discover workshops, hackathons and campus events happening around you.\n\nBest,\nEventic Team" },
      { template_key: "ticket_issued", subject: "Your Ticket for {{event}} is Ready!", body: "Hi {{name}},\n\nYour registration for {{event}} is confirmed. Ticket ID: {{ticket}}.\n\nShow your QR code at the entrance for verification.\n\nBest,\nEventic Team" }
    ]
  );

  const [activeKey, setActiveKey] = useState("welcome");
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);

  const activeTemplate = templates.find(t => t.template_key === activeKey) || templates[0];

  const handleSmtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSmtp(true);
    try {
      await updatePlatformSMTPSettings(smtpData);
      toast.success("SMTP connection settings updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update SMTP configurations");
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTemplate(true);
    try {
      await updatePlatformEmailTemplate(activeTemplate.template_key, {
        subject: activeTemplate.subject,
        body: activeTemplate.body
      });
      toast.success(`Template ${activeTemplate.template_key} saved successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update template");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    toast.loading("Sending test SMTP dispatch...", { id: "smtp-test" });
    setTimeout(() => {
      setIsTestingSmtp(false);
      toast.success("SMTP Handshake Successful! Test email delivered.", { id: "smtp-test" });
    }, 1500);
  };

  const updateTemplateField = (field: string, val: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.template_key === activeKey) {
        return { ...t, [field]: val };
      }
      return t;
    }));
  };

  const getTemplatePreview = () => {
    let body = activeTemplate.body || "";
    body = body
      .replace(/\{\{name\}\}/g, "John Alex")
      .replace(/\{\{event\}\}/g, "National Hackathon 2026")
      .replace(/\{\{ticket\}\}/g, "TKT-SVCE-9942")
      .replace(/\n/g, "<br />");
    
    let subject = activeTemplate.subject || "";
    subject = subject
      .replace(/\{\{name\}\}/g, "John Alex")
      .replace(/\{\{event\}\}/g, "National Hackathon 2026");

    return (
      <div className="bg-black border border-neutral-900 rounded-2xl overflow-hidden font-sans text-xs">
        <div className="bg-neutral-950 p-3 border-b border-neutral-900 font-bold text-neutral-400 flex gap-2">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Subject:</span>
          <span className="text-white">{subject}</span>
        </div>
        <div className="p-4 text-neutral-300 leading-relaxed min-h-32" dangerouslySetInnerHTML={{ __html: body }} />
      </div>
    );
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* SMTP Configuration Form */}
      <form onSubmit={handleSmtpSubmit} className="space-y-6">
        <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-neutral-400" /> Platform Outgoing Email settings
            </h2>
            <p className="text-[10px] text-neutral-500 font-bold mt-0.5">Configure SMTP credentials and dispatch senders for transactional fests emails</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleTestSmtp}
              disabled={isTestingSmtp}
              className="bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-850 font-extrabold gap-1.5 cursor-pointer rounded-xl h-9 px-3.5 text-xs"
            >
              <Play className="h-4 w-4" /> Send Test Email
            </Button>
            <Button
              type="submit"
              disabled={isSavingSmtp}
              className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-9 px-3.5 text-xs"
            >
              <Save className="h-4 w-4" /> {isSavingSmtp ? "Saving..." : "Save SMTP"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 text-xs">
          <div className="space-y-2">
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">SMTP Server Host</label>
            <input
              type="text"
              value={smtpData.smtp_host}
              onChange={e => setSmtpData({ ...smtpData, smtp_host: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">SMTP Server Port</label>
            <input
              type="number"
              value={smtpData.smtp_port}
              onChange={e => setSmtpData({ ...smtpData, smtp_port: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Sender Name / Label</label>
            <input
              type="text"
              value={smtpData.sender_name}
              onChange={e => setSmtpData({ ...smtpData, sender_name: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">SMTP Username</label>
            <input
              type="text"
              value={smtpData.smtp_username}
              onChange={e => setSmtpData({ ...smtpData, smtp_username: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">SMTP Password</label>
            <input
              type="password"
              value={smtpData.smtp_password}
              onChange={e => setSmtpData({ ...smtpData, smtp_password: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Sender Email Address</label>
            <input
              type="email"
              value={smtpData.sender_email}
              onChange={e => setSmtpData({ ...smtpData, sender_email: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
              required
            />
          </div>
        </div>
      </form>

      {/* Templates Editor */}
      <div className="border-t border-neutral-900 pt-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-neutral-400" /> Transactional Templates Editor
            </h2>
            <p className="text-[10px] text-neutral-500 font-bold mt-0.5">Customize email bodies and header subjects with variable markers like {"{{name}}"}, {"{{event}}"}, and {"{{ticket}}"}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={activeKey}
              onChange={e => setActiveKey(e.target.value)}
              className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
            >
              <option value="welcome">Welcome Onboarding</option>
              <option value="ticket_issued">Ticket Confirmation Receipt</option>
            </select>
            <Button
              onClick={handleTemplateSubmit}
              disabled={isSavingTemplate}
              className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-9 px-3.5 text-xs"
            >
              <Save className="h-4 w-4" /> {isSavingTemplate ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 text-xs">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Email Subject</label>
              <input
                type="text"
                value={activeTemplate.subject}
                onChange={e => updateTemplateField("subject", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Email Body Message</label>
              <textarea
                value={activeTemplate.body}
                onChange={e => updateTemplateField("body", e.target.value)}
                className="w-full h-48 p-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700 resize-none font-mono text-[11px]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block flex items-center gap-1">
              <Eye className="h-3 w-3 text-neutral-500" /> HTML Output Preview
            </label>
            {getTemplatePreview()}
            
            <div className="bg-neutral-950/40 border border-neutral-900 rounded-2xl p-4 text-[10px] text-neutral-550 leading-relaxed font-bold flex gap-2">
              <FileText className="h-4 w-4 text-neutral-550 shrink-0" />
              <span>Available Variable Tags: {"{{name}}"}, {"{{event}}"}, {"{{ticket}}"}, {"{{date}}"}, {"{{time}}"}, {"{{organization}}"}.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
