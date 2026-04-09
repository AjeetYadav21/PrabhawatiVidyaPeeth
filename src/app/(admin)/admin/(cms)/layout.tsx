import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { verifyToken } from "@/lib/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { ContactSubmissionModel } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function AdminCmsLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  let email = "Admin";

  try {
    const payload = await verifyToken(token);
    email = payload.email;
  } catch {
    redirect("/admin/login");
  }

  let unreadCount = 0;

  try {
    await connectDB();
    unreadCount = await ContactSubmissionModel.countDocuments({ isRead: false });
  } catch {
    unreadCount = 0;
  }

  return (
    <div className="admin-shell">
      <div className="admin-shell-grid">
        <AdminSidebar unreadCount={unreadCount} />
        <div className="admin-main">
          <AdminTopbar email={email} />
          {children}
        </div>
      </div>
    </div>
  );
}
