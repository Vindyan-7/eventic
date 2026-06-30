"use client";

import React, { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Wifi,
  WifiOff,
  Download,
  RefreshCw,
  QrCode,
  Users,
  CheckCircle,
  Database,
  Lock,
  User,
  LogOut,
  Building,
  AlertTriangle,
  Search,
  Check,
  X,
  FileText
} from "lucide-react";
import { QRScanner } from "./qr-scanner";
import { scanAndCheckIn } from "@/services/scan-and-checkin";
import { searchAttendees } from "@/services/search-attendees";
import { getEventCacheData } from "@/services/event-management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logoutAllScanners } from "@/services/scan-code-actions";
import { logVolunteerActivity } from "@/app/(org)/org/actions";

interface VolunteerDashboardClientProps {
  eventId: string;
  initialEvent: {
    id: string;
    title: string;
    venue: string | null;
    starts_at: string;
    registration_count: number;
    checked_in_count: number;
    remaining_attendees: number;
    attendance_rate: number;
  };
  volunteerName: string;
  workspaceName: string;
  isOwnerOrAdmin: boolean;
}

export function VolunteerDashboardClient({
  eventId,
  initialEvent,
  volunteerName,
  workspaceName,
  isOwnerOrAdmin,
}: VolunteerDashboardClientProps) {
  const [eventStats, setEventStats] = useState(initialEvent);
  const [isOnline, setIsOnline] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [lastCacheUpdate, setLastCacheUpdate] = useState<string | null>(null);
  const [cachedAttendeesCount, setCachedAttendeesCount] = useState(0);

  // Queue states
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Active sub-panels
  const [activeTab, setActiveTab] = useState<"dashboard" | "scanner" | "attendees" | "queue">("dashboard");

  // Scanner scanner view options
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Search & manual check-in
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // IndexedDB database instances
  const dbName = "EventicOfflineDB";
  const dbVersion = 2;

  // 1. Initialize network status & local IndexedDB
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored! Network is online.");
      // Log event
      logVolunteerActivity({ eventId, actionType: "OFFLINE_END" });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Network is offline! Entering offline scanning mode.");
      logVolunteerActivity({ eventId, actionType: "OFFLINE_START" });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Init DB
    initIndexedDB();
    updateQueueCount();

    // Log login activity
    logVolunteerActivity({ eventId, actionType: "LOGIN" });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 2. Background sync monitor when network status goes online
  useEffect(() => {
    if (isOnline && queueCount > 0 && !isSyncing) {
      triggerBackgroundSync();
    }
  }, [isOnline, queueCount]);

  const initIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(dbName, dbVersion);

      request.onerror = () => {
        console.error("IndexedDB error:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        
        // Attendees store
        if (!db.objectStoreNames.contains("attendees")) {
          db.createObjectStore("attendees", { keyPath: "id" });
        }
        
        // Sync queue store
        if (!db.objectStoreNames.contains("sync_queue")) {
          db.createObjectStore("sync_queue", { keyPath: "id", autoIncrement: true });
        }
      };
    });
  };

  const updateQueueCount = async () => {
    try {
      const db = await initIndexedDB();
      const transaction = db.transaction("sync_queue", "readonly");
      const store = transaction.objectStore("sync_queue");
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        setQueueCount(countRequest.result);
      };
    } catch (e) {
      console.error("Failed to read queue count:", e);
    }
  };

  const handleDownloadCache = async () => {
    if (!isOnline) {
      toast.error("You must be online to download today's attendee cache.");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(10);

    try {
      setDownloadProgress(30);
      const data = await getEventCacheData(eventId);
      
      setDownloadProgress(60);
      const db = await initIndexedDB();
      const transaction = db.transaction("attendees", "readwrite");
      const store = transaction.objectStore("attendees");

      // Clear existing records first
      store.clear();

      // Put records
      data.forEach((r) => {
        store.put(r);
      });

      setDownloadProgress(90);
      transaction.oncomplete = () => {
        setDownloadProgress(100);
        setCachedAttendeesCount(data.length);
        setLastCacheUpdate(new Date().toLocaleTimeString());
        setIsDownloading(false);
        toast.success(`Successfully downloaded ${data.length} attendees to local cache!`);
      };

      transaction.onerror = (e) => {
        throw new Error("Transaction failed");
      };
    } catch (err: any) {
      console.error(err);
      setIsDownloading(false);
      toast.error("Failed to download attendee cache. Please try again.");
    }
  };

  const triggerBackgroundSync = async () => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);

    try {
      const db = await initIndexedDB();
      const transaction = db.transaction("sync_queue", "readonly");
      const store = transaction.objectStore("sync_queue");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async () => {
        const queuedItems = getAllRequest.result;
        if (queuedItems.length === 0) {
          setIsSyncing(false);
          return;
        }

        toast.info(`Syncing ${queuedItems.length} queued check-ins to server...`);
        let successCount = 0;

        for (const item of queuedItems) {
          try {
            const res = await scanAndCheckIn(item.registrationId, eventId, item.isManual);
            if (res.success) {
              successCount++;
              // Delete from IndexedDB queue
              const deleteTx = db.transaction("sync_queue", "readwrite");
              deleteTx.objectStore("sync_queue").delete(item.id);
            }
          } catch (itemErr) {
            console.error("Failed to sync item:", item.registrationId, itemErr);
          }
        }

        // Refresh stats
        if (successCount > 0) {
          toast.success(`Background Sync completed: ${successCount} entries updated!`);
          await logVolunteerActivity({
            eventId,
            actionType: "QUEUE_SYNC",
            details: { count: successCount }
          });
          // Reload page to refresh stats
          window.location.reload();
        }
        setIsSyncing(false);
        updateQueueCount();
      };
    } catch (e) {
      console.error("Queue sync error:", e);
      setIsSyncing(false);
    }
  };

  // Perform check-in (supports both online/offline flows)
  const handleCheckIn = async (registrationId: string, isManual = false) => {
    // 1. Offline Flow
    if (!isOnline) {
      try {
        const db = await initIndexedDB();
        
        // Check if already in queue to prevent duplicates
        const checkQueueTx = db.transaction("sync_queue", "readonly");
        const queueStore = checkQueueTx.objectStore("sync_queue");
        const queued = await new Promise<any[]>((resolve) => {
          queueStore.getAll().onsuccess = (e: any) => resolve(e.target.result);
        });

        const isAlreadyQueued = queued.some((q) => q.registrationId === registrationId);
        if (isAlreadyQueued) {
          toast.warning("Check-in is already in the pending sync queue.");
          return;
        }

        // Read cached attendee
        const getTx = db.transaction("attendees", "readonly");
        const attendeeStore = getTx.objectStore("attendees");
        const cachedAttendee = await new Promise<any>((resolve) => {
          attendeeStore.get(registrationId).onsuccess = (e: any) => resolve(e.target.result);
        });

        if (cachedAttendee && cachedAttendee.checked_in) {
          toast.warning("Attendee is already checked in.");
          return;
        }

        // Add to queue
        const putTx = db.transaction("sync_queue", "readwrite");
        putTx.objectStore("sync_queue").put({
          registrationId,
          eventId,
          isManual,
          timestamp: new Date().toISOString(),
        });

        // Update local attendees checked-in status cache
        if (cachedAttendee) {
          const updateTx = db.transaction("attendees", "readwrite");
          updateTx.objectStore("attendees").put({
            ...cachedAttendee,
            checked_in: true,
            checked_in_at: new Date().toISOString(),
          });
        }

        toast.success("Offline check-in queued successfully!");
        updateQueueCount();
        
        // Update stats card locally
        setEventStats((prev) => ({
          ...prev,
          checked_in_count: prev.checked_in_count + 1,
          remaining_attendees: Math.max(0, prev.remaining_attendees - 1),
          attendance_rate: prev.registration_count === 0 ? 0 : Math.round(((prev.checked_in_count + 1) / prev.registration_count) * 100),
        }));
      } catch (err) {
        toast.error("Failed to perform offline check-in.");
      }
      return;
    }

    // 2. Online Flow
    try {
      const res = await scanAndCheckIn(registrationId, eventId, isManual);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(res.alreadyCheckedIn ? "Attendee was already checked in." : "Check-in successful!");
      window.location.reload();
    } catch (e) {
      toast.error("Failed to check in attendee.");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) {
      toast.error("Search query must be at least 2 characters long.");
      return;
    }

    setIsSearching(true);

    // 1. Offline search from IndexedDB
    if (!isOnline) {
      try {
        const db = await initIndexedDB();
        const tx = db.transaction("attendees", "readonly");
        const store = tx.objectStore("attendees");
        const getAllReq = store.getAll();

        getAllReq.onsuccess = () => {
          const q = searchQuery.toLowerCase().trim();
          const filtered = getAllReq.result.filter((r) => 
            r.display_name.toLowerCase().includes(q) ||
            r.ticket_number.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q)
          );
          setSearchResults(filtered);
          setIsSearching(false);
        };
      } catch (err) {
        toast.error("Failed to search offline database.");
        setIsSearching(false);
      }
      return;
    }

    // 2. Online search from server API
    try {
      const res = await searchAttendees(eventId, searchQuery);
      if (res.error) {
        toast.error(res.error);
      } else {
        setSearchResults(res.data || []);
      }
    } catch (e) {
      toast.error("Search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs max-w-xl mx-auto pb-10">
      
      {/* Network Status & Sync Header bar */}
      <div className="rounded-3xl border border-neutral-900 bg-neutral-950 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-850 flex items-center justify-center text-white">
            <Building className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">{workspaceName}</span>
            <span className="font-extrabold text-white text-xs block">{eventStats.title}</span>
          </div>
        </div>

        {/* Sync Status Pill Indicator */}
        <div className="flex items-center gap-1.5">
          {isSyncing ? (
            <span className="bg-blue-950/40 text-blue-400 border border-blue-900/40 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" /> Syncing
            </span>
          ) : isOnline ? (
            <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
              <Wifi className="h-3 w-3" /> Online
            </span>
          ) : (
            <span className="bg-amber-950/40 text-amber-400 border border-amber-900/40 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
              <WifiOff className="h-3 w-3" /> Offline
            </span>
          )}

          {queueCount > 0 && (
            <span className="bg-purple-950/40 text-purple-400 border border-purple-900/40 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
              {queueCount} Pending
            </span>
          )}
        </div>
      </div>

      {/* Main Dashboard tabs switches */}
      <div className="flex border border-neutral-900 rounded-2xl overflow-hidden bg-neutral-950 p-1">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 text-center py-2 font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === "dashboard" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-white"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("scanner")}
          className={`flex-1 text-center py-2 font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === "scanner" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-white"
          }`}
        >
          Scan QR
        </button>
        <button
          onClick={() => setActiveTab("attendees")}
          className={`flex-1 text-center py-2 font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === "attendees" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-white"
          }`}
        >
          Attendees
        </button>
      </div>

      {/* VIEW: Dashboard Main Overview */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-neutral-900 bg-neutral-900/10 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-extrabold text-white">Volunteer Console</h2>
                <p className="text-[10px] text-neutral-500 font-bold mt-0.5">Logged in as {volunteerName}</p>
              </div>
              <form action={logoutAllScanners}>
                <Button type="submit" variant="ghost" className="text-red-400 hover:text-red-500 hover:bg-red-950/20 rounded-xl cursor-pointer">
                  <LogOut className="h-4 w-4 mr-1.5" /> Logout
                </Button>
              </form>
            </div>

            {/* Offline cache settings card */}
            <div className="border border-neutral-900 rounded-2xl p-4 bg-neutral-950/40 space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-neutral-400" /> Local Database Cache
                </span>
                {lastCacheUpdate && (
                  <span className="text-[10px] text-neutral-500 font-mono">Updated: {lastCacheUpdate}</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900/25 border border-neutral-900 p-3 rounded-xl">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Cached Records</span>
                  <span className="text-xl font-extrabold text-white mt-1 block">{cachedAttendeesCount || "-"}</span>
                </div>
                <div className="bg-neutral-900/25 border border-neutral-900 p-3 rounded-xl">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Estimated Size</span>
                  <span className="text-xl font-extrabold text-white mt-1 block">
                    {cachedAttendeesCount ? `${(cachedAttendeesCount * 120 / 1024).toFixed(1)} KB` : "-"}
                  </span>
                </div>
              </div>

              {isDownloading ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400">
                    <span>Downloading database cache...</span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleDownloadCache}
                  disabled={!isOnline}
                  className="w-full bg-white text-black hover:bg-neutral-200 font-extrabold rounded-xl h-10 gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-4 w-4" /> Download Today's Event Cache
                </Button>
              )}
            </div>
          </div>

          {/* Stats KPI cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-neutral-900 bg-neutral-900/10 p-5 space-y-1">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Checked In</span>
              <span className="text-3xl font-extrabold text-emerald-450 block">{eventStats.checked_in_count}</span>
            </div>
            <div className="rounded-3xl border border-neutral-900 bg-neutral-900/10 p-5 space-y-1">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Remaining Entries</span>
              <span className="text-3xl font-extrabold text-orange-450 block">{eventStats.remaining_attendees}</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Scanner scanner frame */}
      {activeTab === "scanner" && (
        <div className="space-y-5">
          <div className="rounded-3xl border border-neutral-900 bg-neutral-950 p-6">
            <QRScanner eventId={eventId} />
          </div>
        </div>
      )}

      {/* VIEW: Manual Attendees search list */}
      {activeTab === "attendees" && (
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by attendee name or ticket number..."
              className="rounded-xl h-10 border-neutral-900 bg-neutral-950 flex-1 text-white"
            />
            <Button type="submit" disabled={isSearching} className="bg-white text-black hover:bg-neutral-200 font-extrabold px-4 h-10 rounded-xl cursor-pointer">
              {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>

          {searchResults.length > 0 ? (
            <div className="border border-neutral-900 rounded-3xl overflow-hidden bg-neutral-950/20 divide-y divide-neutral-900">
              {searchResults.map((attendee) => {
                const isCheckedIn = attendee.checked_in;
                return (
                  <div key={attendee.id} className="p-4 flex justify-between items-center hover:bg-neutral-900/10 transition-colors">
                    <div>
                      <span className="font-extrabold text-white block">
                        {attendee.display_name || attendee.profiles?.full_name || "Unknown Attendee"}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">
                        Ticket: {attendee.ticket_number || attendee.id}
                      </span>
                    </div>

                    <div>
                      {isCheckedIn ? (
                        <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
                          <Check className="h-3 w-3" /> Checked In
                        </span>
                      ) : (
                        <Button
                          onClick={() => handleCheckIn(attendee.id, true)}
                          className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 text-white font-extrabold text-[9px] px-3.5 py-1.5 h-8 rounded-xl cursor-pointer"
                        >
                          Manual Check-In
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 border border-neutral-900 rounded-3xl text-center text-neutral-500">
              {searchQuery.trim().length > 0 ? "No matching attendees found." : "Search database directory."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
