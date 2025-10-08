"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserTable, type UserRow } from "@/components/dashboard/admin/user-management/user-table";
import { UserFilters } from "@/components/dashboard/admin/user-management/user-filters";
import { UserEditDialog } from "@/components/dashboard/admin/user-management/user-edit-dialog";
import { UserCreateForm } from "@/components/dashboard/admin/user-management/user-create-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { listUsers, resetUserPassword, deleteUser } from "@/actions/admin/users";
import { Plus } from "lucide-react";
import { Role, AccountStatus } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UserManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<{
    id: string;
    email: string;
    role: Role;
    status: AccountStatus;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<string | null>(null);
  const [currentUserEmail] = React.useState("");

  const [filters, setFilters] = React.useState({
    role: searchParams.get("role") || undefined,
    accountStatus: searchParams.get("accountStatus") || undefined,
    search: searchParams.get("search") || undefined,
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
  });

  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const page = parseInt(searchParams.get("page") || "1", 10);
      
      const result = await listUsers({
        page,
        limit: pagination.pageSize,
        role: filters.role as Role | undefined,
        status: filters.accountStatus as AccountStatus | undefined,
        search: filters.search,
        sortBy: filters.sortBy as "email" | "role" | "createdAt" | "lastLoginAt",
        sortOrder: filters.sortOrder as "asc" | "desc",
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch users");
      }

      setUsers(result.data.users as UserRow[]);
      setPagination({
        pageIndex: page - 1,
        pageSize: pagination.pageSize,
        totalPages: result.data.pagination.totalPages,
        totalItems: result.data.pagination.total,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, pagination.pageSize, filters, toast]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUrlParams = (newFilters: typeof filters, page = 1) => {
    const params = new URLSearchParams();
    if (newFilters.role) params.set("role", newFilters.role);
    if (newFilters.accountStatus) params.set("accountStatus", newFilters.accountStatus);
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.sortBy) params.set("sortBy", newFilters.sortBy);
    if (newFilters.sortOrder) params.set("sortOrder", newFilters.sortOrder);
    if (page > 1) params.set("page", page.toString());
    router.push(`/dashboard/admin/users?${params.toString()}`);
  };

  const handleFilterChange = (name: string, value: string | Date | undefined) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    updateUrlParams(filters, 1);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      role: undefined,
      accountStatus: undefined,
      search: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(clearedFilters);
    updateUrlParams(clearedFilters, 1);
  };

  const handlePaginationChange = (pageIndex: number) => {
    updateUrlParams(filters, pageIndex + 1);
  };

  const handleEditRole = (userId: string, currentRole: Role) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser({ id: userId, email: user.email, role: currentRole, status: user.accountStatus });
      setEditDialogOpen(true);
    }
  };

  const handleSuspend = (userId: string, currentStatus: AccountStatus) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setSelectedUser({ id: userId, email: user.email, role: user.role, status: currentStatus });
      setEditDialogOpen(true);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const result = await resetUserPassword(userId);
      if (!result.success) throw new Error(result.error || "Failed to reset password");
      toast({ title: "Password reset", description: `Temporary password: ${result.data?.temporaryPassword}` });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to reset password", variant: "destructive" });
    }
  };

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const result = await deleteUser({ userId: userToDelete });
      if (!result.success) throw new Error(result.error || "Failed to delete user");
      toast({ title: "User deleted", description: "User has been deleted successfully" });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete user", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and account statuses</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <UserFilters
        values={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        isLoading={isLoading}
      />

      <UserTable
        users={users}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onEditRole={handleEditRole}
        onSuspend={handleSuspend}
        onResetPassword={handleResetPassword}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <UserCreateForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          setCreateDialogOpen(false);
          fetchUsers();
        }}
      />

      {selectedUser && (
        <UserEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          userId={selectedUser.id}
          currentRole={selectedUser.role}
          currentStatus={selectedUser.status}
          currentUserEmail={selectedUser.email}
          isCurrentUser={selectedUser.email === currentUserEmail}
          onSuccess={() => {
            setEditDialogOpen(false);
            fetchUsers();
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
