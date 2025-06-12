'use client';

import type { ReactNode } from "react";
import ClientProviderWrapper from "../components/ClientProviderWrapper";
import "./globals.css";
import { RootStyleRegistry } from "./RootStyleRegistry";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Breakbeat Showcase</title>
      </head>
      <body>
        {/* Background waves */}
        <div className="wave-container">
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
        </div>

        {/* Triangle background grid */}
        {/* <TriangleGrid /> */}

        {/* App content and providers */}
        <RootStyleRegistry>
          <ClientProviderWrapper>{children}</ClientProviderWrapper>
        </RootStyleRegistry>
      </body>
    </html>
  );
}
