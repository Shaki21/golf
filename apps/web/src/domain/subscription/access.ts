import { TierFeatures } from "./features";

export function hasFeature(
  tier: string,
  feature: string
): boolean {
  return TierFeatures[tier]?.includes(feature as any) ?? false;
}
