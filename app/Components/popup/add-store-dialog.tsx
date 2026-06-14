"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Plus } from "lucide-react";

export function AddStoreDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;

    try {
      setLoading(true);

      const response = await fetch(
        "/api/stores",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      setOpen(false);
      setName("");

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button className="bg-green-700 hover:bg-green-800">
          <Plus className="w-4 h-4 ml-2" />
          إضافة محل
        </Button>
      </DialogTrigger>

      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            إضافة محل جديد
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <Input
            placeholder="اسم المحل"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800"
          >
            {loading
              ? "جاري الحفظ..."
              : "حفظ"}
          </Button>

        </div>

      </DialogContent>
    </Dialog>
  );
}