"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const AGE_VERIFIED_KEY = "age_verified";

function getSnapshot(): boolean | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AGE_VERIFIED_KEY) === "true";
}

function getServerSnapshot(): boolean | null {
  return null;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function AgeGate() {
  const isVerified = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const handleConfirm = () => {
    localStorage.setItem(AGE_VERIFIED_KEY, "true");
    window.dispatchEvent(new Event("storage"));
  };

  const handleDeny = () => {
    window.location.href = "https://www.google.com";
  };

  // SSR時やマウント前、または確認済みの場合は何も表示しない
  if (isVerified === null || isVerified === true) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="mx-4 max-w-md rounded-lg bg-background p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-foreground">年齢確認</h2>
        <p className="mb-6 text-muted-foreground">
          このサイトには成人向けコンテンツが含まれています。
          <br />
          あなたは18歳以上ですか？
        </p>
        <div className="flex gap-3">
          <Button onClick={handleConfirm} className="flex-1">
            はい、18歳以上です
          </Button>
          <Button onClick={handleDeny} variant="outline" className="flex-1">
            いいえ
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          18歳未満の方はご利用いただけません。
        </p>
      </div>
    </div>
  );
}
