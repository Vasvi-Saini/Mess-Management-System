"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Menu {
  id: string;
  mealType: string;
  ratings: { id: string }[];
}

interface RatingFormProps {
  menus: Menu[];
}

export function RatingForm({ menus }: RatingFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("");
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");

  const unratedMenus = menus.filter((m) => m.ratings.length === 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenu || !score) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuId: selectedMenu,
          score: parseInt(score),
          comment,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Rating submitted successfully");
      setSelectedMenu("");
      setScore("");
      setComment("");
    } catch {
      toast.error("Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  if (unratedMenus.length === 0) {
    return <p className="text-sm text-muted-foreground">All meals rated for today</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select value={selectedMenu} onValueChange={setSelectedMenu}>
        <SelectTrigger>
          <SelectValue placeholder="Select meal" />
        </SelectTrigger>
        <SelectContent>
          {unratedMenus.map((menu) => (
            <SelectItem key={menu.id} value={menu.id}>
              {menu.mealType}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={score} onValueChange={setScore}>
        <SelectTrigger>
          <SelectValue placeholder="Rating (1-5)" />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4, 5].map((n) => (
            <SelectItem key={n} value={n.toString()}>
              {n} Star{n > 1 ? "s" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Textarea
        placeholder="Comments (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <Button type="submit" className="w-full" disabled={loading || !selectedMenu || !score}>
        {loading ? "Submitting..." : "Submit Rating"}
      </Button>
    </form>
  );
}
