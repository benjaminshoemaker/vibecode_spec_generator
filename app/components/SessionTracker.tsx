"use client";

import { useEffect } from "react";
import { trackSessionStart } from "@/app/utils/analytics";

export function SessionTracker() {
  useEffect(() => {
    trackSessionStart();
  }, []);

  return null;
}
