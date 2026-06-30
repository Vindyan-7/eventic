import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getNotifications } from "@/services/notification-service";
import type { NotificationCategory, NotificationPriority } from "@/services/notification-service";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const category = searchParams.get("category") as NotificationCategory | null;
    const isRead = searchParams.get("isRead") === "true" ? true : searchParams.get("isRead") === "false" ? false : undefined;
    const isArchived = searchParams.get("isArchived") === "true" ? true : false;
    const priority = searchParams.get("priority") as NotificationPriority | null;
    const search = searchParams.get("search") || undefined;

    const data = await getNotifications({
      page,
      limit,
      category: category || undefined,
      isRead,
      isArchived,
      priority: priority || undefined,
      search,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch notifications" }, { status: 500 });
  }
}
