"use client";

import { SlideDeck } from "@/components/slides/slide-deck";
import { slides } from "@/components/slides/proposal/slides";

export function Presentation() {
  return <SlideDeck slides={slides} />;
}
