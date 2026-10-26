"use client";
import { useTranslations } from "next-intl";

import { Button } from "./ui/button";
export function GoogleSignIn() {
  const gatewayCopy = useTranslations("gateway.copy");

  return (
    <form action="/auth/google" method="post">
      <Button type="submit" className="w-full">
        {gatewayCopy("m083")}
      </Button>
    </form>
  );
}
