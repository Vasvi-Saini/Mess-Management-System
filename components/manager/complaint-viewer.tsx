"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Complaint {
  id: string;
  category: string;
  title: string;
  description: string;
  status: string;
  isAnonymous: boolean;
  createdAt: Date;
  user: { name: string | null } | null;
}

interface ComplaintViewerProps {
  complaints: Complaint[];
}

export function ComplaintViewer({ complaints: initialComplaints }: ComplaintViewerProps) {
  const [complaints, setComplaints] = useState(initialComplaints);

  const handleUpdate = async (id: string, status: string, response: string) => {
    try {
      const res = await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, response }),
      });

      if (!res.ok) throw new Error();

      setComplaints(complaints.filter((c) => c.id !== id));
      toast.success("Complaint updated");
    } catch {
      toast.error("Failed to update complaint");
    }
  };

  if (complaints.length === 0) {
    return <p className="text-muted-foreground">No pending complaints</p>;
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <div key={complaint.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium">{complaint.title}</h4>
              <p className="text-sm text-muted-foreground">
                {complaint.isAnonymous ? "Anonymous" : complaint.user?.name} •{" "}
                {complaint.category}
              </p>
            </div>
            <Badge variant={complaint.status === "PENDING" ? "secondary" : "default"}>
              {complaint.status}
            </Badge>
          </div>
          <p className="text-sm mb-4">{complaint.description}</p>

          <ComplaintResponseDialog complaint={complaint} onUpdate={handleUpdate} />
        </div>
      ))}
    </div>
  );
}

function ComplaintResponseDialog({
  complaint,
  onUpdate,
}: {
  complaint: Complaint;
  onUpdate: (id: string, status: string, response: string) => void;
}) {
  const [status, setStatus] = useState(complaint.status);
  const [response, setResponse] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Respond
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Respond to Complaint</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Your response..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />

          <Button
            onClick={() => onUpdate(complaint.id, status, response)}
            className="w-full"
          >
            Submit Response
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
