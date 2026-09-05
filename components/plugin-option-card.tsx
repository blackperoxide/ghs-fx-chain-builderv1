import type { PluginOption } from "@/lib/chain-data"
import { categoryLabels, type Category } from "@/lib/plugin-library"
import { getBrandColor } from "@/lib/brand-colors"
import { cn } from "@/lib/utils"

// Module-card treatment modeled on Nuro Audio's "Meet the Modules" cards: a
// name, a plain-language tip, and two small pill tags (category + brand) —
// same two-tag pattern as their category/series tags, built from data the
// app already has (categorize() + getBrandColor()), not new content.
export function PluginOptionCard({ option, category }: { option: PluginOption; category?: Category }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3 space-y-2">
      <span className="font-medium">{option.plugin}</span>
      <div className="flex flex-wrap gap-1.5">
        {category && (
          <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
            {categoryLabels[category]}
          </span>
        )}
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white",
            getBrandColor(option.brand)
          )}
        >
          {option.brand}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{option.tip}</p>
    </div>
  )
}
