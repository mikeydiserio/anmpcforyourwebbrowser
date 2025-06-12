"use client";

import React from "react";

import { SampleProvider } from "../context/SampleContext";

export default function ClientProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <SampleProvider>{children}</SampleProvider>
  );
}
