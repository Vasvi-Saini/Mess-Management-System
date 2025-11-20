"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  hostel: string | null;
  credits: number;
  createdAt: Date;
}

export function UserManagement({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState(initialUsers);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/users/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) throw new Error();

      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Hostel</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name || "N/A"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.hostel || "N/A"}</TableCell>
              <TableCell>{user.credits.toFixed(2)}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="MESS_MANAGER">Manager</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
