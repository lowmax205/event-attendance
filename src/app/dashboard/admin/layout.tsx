import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Shield } from "lucide-react";

/**
 * Admin dashboard layout
 * Admin navigation with tabs (Overview/Users)
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-destructive" />
              <h2 className="text-2xl font-bold">Administration</h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <Link href="/dashboard/admin" passHref legacyBehavior>
                <TabsTrigger value="overview" asChild>
                  <a>Overview</a>
                </TabsTrigger>
              </Link>
              <Link href="/dashboard/admin/users" passHref legacyBehavior>
                <TabsTrigger value="users" asChild>
                  <a>Users</a>
                </TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <main>{children}</main>
    </div>
  );
}
