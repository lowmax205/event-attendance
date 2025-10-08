"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/dashboard/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, Ban, Trash2, KeyRound } from "lucide-react";
import { format } from "date-fns";
import { AccountStatus, Role } from "@prisma/client";

export interface UserRow {
  id: string;
  email: string;
  role: Role;
  accountStatus: AccountStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
}

interface UserTableProps {
  users: UserRow[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  onPaginationChange: (pageIndex: number) => void;
  onEditRole: (userId: string, currentRole: Role) => void;
  onSuspend: (userId: string, currentStatus: AccountStatus) => void;
  onResetPassword: (userId: string) => void;
  onDelete: (userId: string) => void;
  isLoading?: boolean;
}

export function UserTable({
  users,
  pagination,
  onPaginationChange,
  onEditRole,
  onSuspend,
  onResetPassword,
  onDelete,
  isLoading = false,
}: UserTableProps) {
  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as Role;
        const roleColors: Record<Role, string> = {
          Student:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          Moderator:
            "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
          Administrator:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        };
        return (
          <Badge variant="outline" className={roleColors[role]}>
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "accountStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("accountStatus") as AccountStatus;
        const statusColors: Record<AccountStatus, string> = {
          ACTIVE:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          SUSPENDED:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        };
        return (
          <Badge variant="outline" className={statusColors[status]}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "lastLoginAt",
      header: "Last Login",
      cell: ({ row }) => {
        const lastLogin = row.getValue("lastLoginAt") as Date | null;
        if (!lastLogin) {
          return <span className="text-muted-foreground">Never</span>;
        }
        return (
          <span className="text-sm">
            {format(lastLogin, "MMM dd, yyyy HH:mm")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="Open menu"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEditRole(user.id, user.role)}
                className="cursor-pointer"
              >
                <Shield className="mr-2 h-4 w-4" />
                <span>Change Role</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSuspend(user.id, user.accountStatus)}
                className="cursor-pointer"
              >
                <Ban className="mr-2 h-4 w-4" />
                <span>
                  {user.accountStatus === "ACTIVE" ? "Suspend" : "Activate"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onResetPassword(user.id)}
                className="cursor-pointer"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                <span>Reset Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(user.id)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      isLoading={isLoading}
    />
  );
}
