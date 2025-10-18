// This file is deprecated and uses old Tailwind v3 API
// TODO: Remove or update to use Tailwind v4 compile() API
import type { TailwindConfig } from '../index'

export function getCssForMarkup(markup: string, config: TailwindConfig | undefined): string {
  throw new Error('getCssForMarkup is deprecated. Use getTailwindStyles from tailwindcss.ts instead')
}
