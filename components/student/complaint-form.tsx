"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CATEGORIES = [
  "Food Quality",
  "Hygiene",
  "Service",
  "Menu",
  "Timing",
  "Other",
];

export function ComplaintForm() {
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      category: formData.get("category"),
      title: formData.get("title"),
      description: formData.get("description"),
      isAnonymous,
    };

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.success("Complaint submitted successfully");
      e.currentTarget.reset();
      setIsAnonymous(false);
    } catch {
      toast.error("Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select name="category" required>
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input name="title" placeholder="Title" required />

      <Textarea name="description" placeholder="Description" required />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="anonymous" className="text-sm">
          Submit anonymously
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Submit Complaint"}
      </Button>
    </form>
  );
}
