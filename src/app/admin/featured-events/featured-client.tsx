"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable
} from "@/components/admin/ui";
import { featureEvent, pinEvent, updateFeaturedOrder } from "@/app/admin/actions";
import { toast } from "sonner";
import {
  Star,
  Pin,
  ArrowUp,
  ArrowDown,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturedEventRecord {
  id: string;
  title: string;
  is_featured: boolean;
  is_pinned: boolean;
  featured_order: number;
  organization_name: string;
}

export function FeaturedClient({ initialEvents }: { initialEvents: FeaturedEventRecord[] }) {
  const [events, setEvents] = useState<FeaturedEventRecord[]>(initialEvents);
  const [isPending, startTransition] = useTransition();

  const featuredList = events.filter(e => e.is_featured).sort((a, b) => a.featured_order - b.featured_order);
  const unfeaturedList = events.filter(e => !e.is_featured);

  const handleToggleFeature = (id: string, current: boolean) => {
    if (!current && featuredList.length >= 10) {
      toast.warning("Maximum of 10 featured events allowed at once.");
      return;
    }

    startTransition(async () => {
      try {
        await featureEvent(id, !current);
        setEvents(prev => prev.map(e => {
          if (e.id === id) {
            return {
              ...e,
              is_featured: !current,
              featured_order: !current ? featuredList.length : 0
            };
          }
          return e;
        }));
        toast.success(current ? "Removed from featured carousel" : "Added to featured carousel");
      } catch (err: any) {
        toast.error(err.message || "Failed to update feature status");
      }
    });
  };

  const handleTogglePin = (id: string, current: boolean) => {
    startTransition(async () => {
      try {
        await pinEvent(id, !current);
        setEvents(prev => prev.map(e => e.id === id ? { ...e, is_pinned: !current } : e));
        toast.success(current ? "Event unpinned" : "Event pinned at the top");
      } catch (err: any) {
        toast.error(err.message || "Failed to update pin status");
      }
    });
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const list = [...featuredList];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap items
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Save order
    const orderedIds = list.map(item => item.id);
    startTransition(async () => {
      try {
        await updateFeaturedOrder(orderedIds);
        setEvents(prev => prev.map(e => {
          const newIdx = orderedIds.indexOf(e.id);
          if (newIdx !== -1) {
            return { ...e, featured_order: newIdx };
          }
          return e;
        }));
        toast.success("Featured order updated");
      } catch (err: any) {
        toast.error("Failed to update ordering");
      }
    });
  };

  return (
    <div className="space-y-8 font-sans">
      <AdminHeader
        title="Featured Carousel Editor"
        description="Choose and arrange up to 10 events highlighted on the Eventic Home page"
      />

      <div className="bg-neutral-900/30 border border-neutral-850 p-4 rounded-2xl flex items-center gap-3 text-xs text-neutral-400">
        <Info className="h-4 w-4 text-neutral-400 shrink-0" />
        <span>Featured events display at the top of the homepage slider. Use Pin to anchor important events. Limit: 10 events.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured list (Editable Order) */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Star className="h-4 w-4 fill-white" /> Featured Events ({featuredList.length} / 10)
          </h3>

          {featuredList.length === 0 ? (
            <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-8 text-center text-xs text-neutral-500">
              No featured events. Select from the catalog on the right.
            </div>
          ) : (
            <div className="border border-neutral-850 bg-neutral-950 rounded-3xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-850 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3 pl-4">Order</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {featuredList.map((item, index) => (
                    <tr key={item.id} className="text-neutral-300 hover:bg-neutral-900/20">
                      <td className="p-3 pl-4 font-bold text-white">
                        #{index + 1}
                      </td>
                      <td className="p-3 font-bold text-white">
                        {item.title}
                        <span className="block text-[10px] text-neutral-500 mt-0.5">{item.organization_name}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => moveItem(index, "up")}
                            disabled={index === 0 || isPending}
                            className="size-7 text-neutral-400 hover:text-white"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => moveItem(index, "down")}
                            disabled={index === featuredList.length - 1 || isPending}
                            className="size-7 text-neutral-400 hover:text-white"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleTogglePin(item.id, item.is_pinned)}
                            disabled={isPending}
                            className={`size-7 ${item.is_pinned ? "text-amber-400" : "text-neutral-500 hover:text-white"}`}
                          >
                            <Pin className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="xs"
                            onClick={() => handleToggleFeature(item.id, true)}
                            disabled={isPending}
                            className="bg-neutral-900 border border-neutral-800 text-red-400 hover:bg-neutral-850 h-7 text-[10px] px-2 rounded-lg font-bold"
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Catalog */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-neutral-450">
            Available Published Events ({unfeaturedList.length})
          </h3>

          <div className="max-h-96 overflow-y-auto border border-neutral-900 bg-neutral-950 rounded-3xl text-xs divide-y divide-neutral-900">
            {unfeaturedList.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                No published events available to feature.
              </div>
            ) : (
              unfeaturedList.map(item => (
                <div key={item.id} className="p-4 flex justify-between items-center hover:bg-neutral-900/10">
                  <div>
                    <span className="font-extrabold text-white block">{item.title}</span>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">{item.organization_name}</span>
                  </div>
                  <Button
                    size="xs"
                    onClick={() => handleToggleFeature(item.id, false)}
                    disabled={isPending}
                    className="bg-white text-black hover:bg-neutral-200 h-7 text-[10px] px-2.5 rounded-lg font-bold cursor-pointer"
                  >
                    Feature
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
