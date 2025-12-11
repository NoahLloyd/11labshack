"use client";

import { useRef } from "react";
import PackBasket, { PackBasketRef } from "@/components/PackBasket";

export default function PackBasketTestPage() {
  const basketRef = useRef<PackBasketRef>(null);

  const handleItemPickedUp = (itemId: string) => {
    console.log("Picked up:", itemId);
  };

  const handleItemDropped = (itemId: string, inBasket: boolean) => {
    console.log("Dropped:", itemId, inBasket ? "→ IN BASKET" : "→ on table");
  };

  const handleBasketChange = (items: string[]) => {
    console.log("Basket now contains:", items);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black">
      <div className="w-full max-h-full">
        <PackBasket
          ref={basketRef}
          onItemPickedUp={handleItemPickedUp}
          onItemDropped={handleItemDropped}
          onBasketChange={handleBasketChange}
          maxItems={3}
        />
      </div>
    </div>
  );
}
