interface Props {
  stock:             number;
  lowStockThreshold: number;
}

export default function StockBadge({ stock, lowStockThreshold }: Props) {
  if (stock === 0)
    return (
      <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
        Out of stock
      </span>
    );
  if (stock <= lowStockThreshold)
    return (
      <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
        Only {stock} left
      </span>
    );
  return (
    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
      In stock
    </span>
  );
}
