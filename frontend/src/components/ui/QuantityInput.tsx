"use client";

import Button from "./Button";

export default function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center border border-bb-border rounded-md overflow-hidden">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="rounded-none px-3"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
      >
        <i className="ri-subtract-line" />
      </Button>
      <input
        type="number"
        className="w-12 border-x border-bb-border text-center py-2 outline-none bg-transparent"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const next = Number(e.target.value) || min;
          onChange(Math.min(max, Math.max(min, next)));
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="rounded-none px-3"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase quantity"
      >
        <i className="ri-add-line" />
      </Button>
    </div>
  );
}
