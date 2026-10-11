"use client";

import { useState } from "react";
import { m } from "@/lib/labels";
import { clearAll } from "./store";
import { Button } from "./ui/button";

export function DeleteData() {
  const [deleted, setDeleted] = useState(false);
  return (
    <div className="grid justify-items-start gap-2.5">
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          if (!window.confirm(m.privacy.deleteConfirm)) return;
          clearAll();
          setDeleted(true);
        }}
      >
        {m.privacy.deleteButton}
      </Button>
      <p className="note" role="status">
        {deleted ? m.privacy.deleted : ""}
      </p>
    </div>
  );
}
