"use client";

import {
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import Image from "next/image";

// Item definitions with initial positions (percentage-based) and relative sizes
const ITEMS = [
  {
    id: "soup",
    name: "Warm Soup",
    emoji: "🍲",
    initialX: 28,
    initialY: 22,
    size: 14,
  },
  {
    id: "bread",
    name: "Fresh Bread",
    emoji: "🍞",
    initialX: 62,
    initialY: 10,
    size: 15,
  },
  {
    id: "medicine",
    name: "Medicine",
    emoji: "💊",
    initialX: 25,
    initialY: 45,
    size: 12,
  },
  {
    id: "flowers",
    name: "Flowers",
    emoji: "💐",
    initialX: 67,
    initialY: 35,
    size: 14,
  },
  {
    id: "blanket",
    name: "Blanket",
    emoji: "🧣",
    initialX: 33,
    initialY: 62,
    size: 16,
  },
] as const;

type ItemId = (typeof ITEMS)[number]["id"];

interface Position {
  x: number;
  y: number;
}

interface ItemState {
  position: Position;
  inBasket: boolean;
}

export interface PackBasketRef {
  getBasketItems: () => string[];
  completeSelection: () => string[];
  reset: () => void;
}

interface PackBasketProps {
  onItemPickedUp?: (itemId: string) => void;
  onItemDropped?: (itemId: string, inBasket: boolean) => void;
  onBasketChange?: (items: string[]) => void;
  maxItems?: number;
}

// Basket center and drop zone (percentage-based)
const BASKET_CENTER = { x: 55, y: 33 };
const BASKET_RADIUS = 15;

const PackBasket = forwardRef<PackBasketRef, PackBasketProps>(
  ({ onItemPickedUp, onItemDropped, onBasketChange, maxItems = 3 }, ref) => {
    const [itemStates, setItemStates] = useState<Record<ItemId, ItemState>>(
      () => {
        const initial: Record<string, ItemState> = {};
        ITEMS.forEach((item) => {
          initial[item.id] = {
            position: { x: item.initialX, y: item.initialY },
            inBasket: false,
          };
        });
        return initial as Record<ItemId, ItemState>;
      }
    );

    const [draggingItem, setDraggingItem] = useState<ItemId | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef<{ x: number; y: number } | null>(null);
    const itemStartPos = useRef<Position | null>(null);

    const basketItems = Object.entries(itemStates)
      .filter(([, state]) => state.inBasket)
      .map(([id]) => id);

    const isInBasketZone = useCallback((x: number, y: number): boolean => {
      const dx = x - BASKET_CENTER.x;
      const dy = y - BASKET_CENTER.y;
      return Math.sqrt(dx * dx + dy * dy) < BASKET_RADIUS;
    }, []);

    const getBasketSnapPosition = useCallback((index: number): Position => {
      const positions = [
        { x: BASKET_CENTER.x - 6, y: BASKET_CENTER.y - 2 },
        { x: BASKET_CENTER.x + 6, y: BASKET_CENTER.y - 2 },
        { x: BASKET_CENTER.x, y: BASKET_CENTER.y + 6 },
      ];
      return positions[index % positions.length];
    }, []);

    const handlePointerDown = useCallback(
      (e: React.PointerEvent, itemId: ItemId) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.currentTarget as HTMLElement;
        target.setPointerCapture(e.pointerId);

        setDraggingItem(itemId);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        itemStartPos.current = { ...itemStates[itemId].position };

        onItemPickedUp?.(itemId);
      },
      [itemStates, onItemPickedUp]
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (
          !draggingItem ||
          !containerRef.current ||
          !dragStartPos.current ||
          !itemStartPos.current
        ) {
          return;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const deltaX =
          ((e.clientX - dragStartPos.current.x) / rect.width) * 100;
        const deltaY =
          ((e.clientY - dragStartPos.current.y) / rect.height) * 100;

        const newX = Math.max(0, Math.min(88, itemStartPos.current.x + deltaX));
        const newY = Math.max(0, Math.min(88, itemStartPos.current.y + deltaY));

        setItemStates((prev) => ({
          ...prev,
          [draggingItem]: {
            ...prev[draggingItem],
            position: { x: newX, y: newY },
          },
        }));
      },
      [draggingItem]
    );

    const handlePointerUp = useCallback(
      (e: React.PointerEvent) => {
        if (!draggingItem) return;

        const target = e.currentTarget as HTMLElement;
        target.releasePointerCapture(e.pointerId);

        const currentState = itemStates[draggingItem];
        const wasInBasket = currentState.inBasket;
        const isNowInBasket = isInBasketZone(
          currentState.position.x,
          currentState.position.y
        );

        const currentBasketCount = basketItems.filter(
          (id) => id !== draggingItem
        ).length;
        const canAddToBasket =
          !wasInBasket && isNowInBasket && currentBasketCount < maxItems;
        const willBeInBasket = wasInBasket ? isNowInBasket : canAddToBasket;

        setItemStates((prev) => {
          const newStates = { ...prev };

          if (willBeInBasket && !wasInBasket) {
            newStates[draggingItem] = {
              position: getBasketSnapPosition(currentBasketCount),
              inBasket: true,
            };
          } else if (!isNowInBasket && wasInBasket) {
            newStates[draggingItem] = {
              position: currentState.position,
              inBasket: false,
            };
          } else {
            newStates[draggingItem] = {
              position: currentState.position,
              inBasket: wasInBasket && isNowInBasket,
            };
          }

          return newStates;
        });

        // Notify about the drop
        onItemDropped?.(draggingItem, willBeInBasket);

        // Notify about basket change if it changed
        const newBasketItems = willBeInBasket
          ? wasInBasket
            ? basketItems
            : [...basketItems, draggingItem]
          : basketItems.filter((id) => id !== draggingItem);

        if (
          newBasketItems.length !== basketItems.length ||
          !newBasketItems.every((id) => basketItems.includes(id))
        ) {
          onBasketChange?.(newBasketItems);
        }

        setDraggingItem(null);
        dragStartPos.current = null;
        itemStartPos.current = null;
      },
      [
        draggingItem,
        itemStates,
        basketItems,
        maxItems,
        isInBasketZone,
        getBasketSnapPosition,
        onItemDropped,
        onBasketChange,
      ]
    );

    const getBasketItems = useCallback(() => [...basketItems], [basketItems]);

    const completeSelection = useCallback(
      () => [...basketItems],
      [basketItems]
    );

    const reset = useCallback(() => {
      setItemStates(() => {
        const initial: Record<string, ItemState> = {};
        ITEMS.forEach((item) => {
          initial[item.id] = {
            position: { x: item.initialX, y: item.initialY },
            inBasket: false,
          };
        });
        return initial as Record<ItemId, ItemState>;
      });
    }, []);

    useImperativeHandle(
      ref,
      () => ({ getBasketItems, completeSelection, reset }),
      [getBasketItems, completeSelection, reset]
    );

    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video select-none touch-none overflow-hidden"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Background - table image */}
        <Image
          src="/story/pack-basket/table.png"
          alt=""
          fill
          className="object-cover pointer-events-none"
          draggable={false}
          priority
        />

        {/* Basket image */}
        <div
          className="absolute w-[28%] aspect-square pointer-events-none"
          style={{
            left: `${BASKET_CENTER.x - 14}%`,
            top: `${BASKET_CENTER.y - 14}%`,
          }}
        >
          <Image
            src="/story/pack-basket/basket.png"
            alt=""
            fill
            className={`object-contain transition-transform duration-200 ${
              draggingItem ? "scale-110" : "scale-100"
            }`}
            draggable={false}
          />
        </div>

        {/* Draggable items */}
        {ITEMS.map((item) => {
          const state = itemStates[item.id];
          const isDragging = draggingItem === item.id;

          return (
            <div
              key={item.id}
              className={`absolute aspect-square cursor-grab active:cursor-grabbing ${
                isDragging ? "z-50" : state.inBasket ? "z-20" : "z-10"
              }`}
              style={{
                width: `${item.size}%`,
                left: `${state.position.x}%`,
                top: `${state.position.y}%`,
                transition: isDragging
                  ? "none"
                  : "left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.15s ease-out",
                transform: isDragging ? "scale(1.15)" : "scale(1)",
              }}
              onPointerDown={(e) => handlePointerDown(e, item.id)}
            >
              <Image
                src={`/story/pack-basket/${item.id}.png`}
                alt={item.name}
                fill
                className="object-contain pointer-events-none"
                draggable={false}
              />
            </div>
          );
        })}
      </div>
    );
  }
);

PackBasket.displayName = "PackBasket";

export default PackBasket;
