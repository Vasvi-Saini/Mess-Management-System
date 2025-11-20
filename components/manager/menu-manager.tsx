"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function MenuManager() {
  const [loading, setLoading] = useState(false);
  const [mealType, setMealType] = useState("");
  const [items, setItems] = useState("");
  const [specialItem, setSpecialItem] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealType || !items) return;

    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today.toISOString(),
          mealType,
          items: items.split(",").map((i) => i.trim()),
          specialItem: specialItem || null,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Menu updated successfully");
      setItems("");
      setSpecialItem("");
    } catch {
      toast.error("Failed to update menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Meal Type</Label>
        <Select value={mealType} onValueChange={setMealType}>
          <SelectTrigger>
            <SelectValue placeholder="Select meal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BREAKFAST">Breakfast</SelectItem>
            <SelectItem value="LUNCH">Lunch</SelectItem>
            <SelectItem value="DINNER">Dinner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Items (comma-separated)</Label>
        <Input
          value={items}
          onChange={(e) => setItems(e.target.value)}
          placeholder="Rice, Dal, Sabji, Roti"
        />
      </div>

      <div className="space-y-2">
        <Label>Special Item (optional)</Label>
        <Input
          value={specialItem}
          onChange={(e) => setSpecialItem(e.target.value)}
          placeholder="Gulab Jamun"
        />
      </div>

      <Button type="submit" disabled={loading || !mealType || !items}>
        {loading ? "Saving..." : "Save Menu"}
      </Button>
    </form>
  );
}
