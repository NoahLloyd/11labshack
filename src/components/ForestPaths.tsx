"use client";

import Image from "next/image";

export default function ForestPaths() {
  return (
    <div className="relative h-full max-h-screen aspect-[1696/2528] select-none">
      <Image
        src="/story/paths.png"
        alt="Two forest paths leading to Grandma's house"
        fill
        className="object-contain"
        draggable={false}
        priority
      />
    </div>
  );
}
