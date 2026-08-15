export interface RingOdds {
  common: number
  uncommon: number
  rare: number
  veryRare: number
  ultraRare: number
}

export type CountRange = [number, number]

export interface RarityCountRanges {
  common: CountRange
  uncommon: CountRange
  rare: CountRange
  veryRare: CountRange
  ultraRare: CountRange
}

export interface ItemTypeCountRanges {
  perks: CountRange
  offerings: CountRange
  items: CountRange
  addons: CountRange
  mysteryBoxes: CountRange
}

export interface BloodwebLevelData {
  level: number
  nodes: { inner: number; middle: number; outer: number }
  rarityCounts: RarityCountRanges
  itemCounts: ItemTypeCountRanges
  innerRing: RingOdds
  middleRing: RingOdds
  outerRing: RingOdds
}

export const BLOODWEB_LEVELS: BloodwebLevelData[] = [
  {
    level: 1,
    nodes: { inner: 3, middle: 1, outer: 0 },
    rarityCounts: { common: [0, 4], uncommon: [0, 2], rare: [0, 1], veryRare: [0, 0], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [0, 2], items: [1, 1], addons: [0, 3], mysteryBoxes: [0, 0] },
    innerRing: { common: 76.34, uncommon: 22.9, rare: 0.76, veryRare: 0.0, ultraRare: 0.0 },
    middleRing: { common: 65.79, uncommon: 32.89, rare: 1.32, veryRare: 0.0, ultraRare: 0.0 },
    outerRing: { common: 83.33, uncommon: 8.33, rare: 8.33, veryRare: 0.0, ultraRare: 0.0 },
  },
  {
    level: 2,
    nodes: { inner: 3, middle: 1, outer: 0 },
    rarityCounts: { common: [0, 4], uncommon: [0, 2], rare: [0, 1], veryRare: [0, 0], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [1, 2], items: [1, 1], addons: [0, 3], mysteryBoxes: [0, 0] },
    innerRing: { common: 76.34, uncommon: 22.9, rare: 0.76, veryRare: 0.0, ultraRare: 0.0 },
    middleRing: { common: 62.5, uncommon: 31.25, rare: 6.25, veryRare: 0.0, ultraRare: 0.0 },
    outerRing: { common: 83.33, uncommon: 8.33, rare: 8.33, veryRare: 0.0, ultraRare: 0.0 },
  },
  {
    level: 3,
    nodes: { inner: 3, middle: 1, outer: 0 },
    rarityCounts: { common: [0, 4], uncommon: [0, 2], rare: [0, 1], veryRare: [0, 0], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [1, 2], items: [0, 1], addons: [1, 3], mysteryBoxes: [1, 1] },
    innerRing: { common: 76.34, uncommon: 22.9, rare: 0.76, veryRare: 0.0, ultraRare: 0.0 },
    middleRing: { common: 62.5, uncommon: 31.25, rare: 6.25, veryRare: 0.0, ultraRare: 0.0 },
    outerRing: { common: 83.33, uncommon: 8.33, rare: 8.33, veryRare: 0.0, ultraRare: 0.0 },
  },
  {
    level: 4,
    nodes: { inner: 3, middle: 2, outer: 0 },
    rarityCounts: { common: [0, 5], uncommon: [0, 2], rare: [0, 1], veryRare: [0, 0], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [1, 3], items: [1, 1], addons: [1, 4], mysteryBoxes: [0, 0] },
    innerRing: { common: 76.34, uncommon: 22.9, rare: 0.76, veryRare: 0.0, ultraRare: 0.0 },
    middleRing: { common: 55.56, uncommon: 27.78, rare: 16.67, veryRare: 0.0, ultraRare: 0.0 },
    outerRing: { common: 19.61, uncommon: 1.96, rare: 78.43, veryRare: 0.0, ultraRare: 0.0 },
  },
  {
    level: 5,
    nodes: { inner: 3, middle: 2, outer: 0 },
    rarityCounts: { common: [0, 5], uncommon: [0, 2], rare: [0, 1], veryRare: [0, 0], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [1, 3], items: [0, 1], addons: [1, 4], mysteryBoxes: [1, 1] },
    innerRing: { common: 76.34, uncommon: 22.9, rare: 0.76, veryRare: 0.0, ultraRare: 0.0 },
    middleRing: { common: 55.56, uncommon: 27.78, rare: 16.67, veryRare: 0.0, ultraRare: 0.0 },
    outerRing: { common: 19.61, uncommon: 1.96, rare: 78.43, veryRare: 0.0, ultraRare: 0.0 },
  },
  {
    level: 6,
    nodes: { inner: 3, middle: 1, outer: 0 },
    rarityCounts: { common: [0, 4], uncommon: [0, 2], rare: [0, 1], veryRare: [0, 0], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [1, 2], items: [1, 2], addons: [1, 3], mysteryBoxes: [0, 0] },
    innerRing: { common: 76.34, uncommon: 22.9, rare: 0.76, veryRare: 0.0, ultraRare: 0.0 },
    middleRing: { common: 55.56, uncommon: 27.78, rare: 16.67, veryRare: 0.0, ultraRare: 0.0 },
    outerRing: { common: 19.61, uncommon: 1.96, rare: 78.43, veryRare: 0.0, ultraRare: 0.0 },
  },
  {
    level: 7,
    nodes: { inner: 3, middle: 2, outer: 1 },
    rarityCounts: { common: [0, 6], uncommon: [1, 3], rare: [1, 1], veryRare: [0, 0], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [1, 3], items: [1, 2], addons: [1, 4], mysteryBoxes: [0, 0] },
    innerRing: { common: 76.34, uncommon: 22.9, rare: 0.76, veryRare: 0.0, ultraRare: 0.0 },
    middleRing: { common: 55.56, uncommon: 27.78, rare: 16.67, veryRare: 0.0, ultraRare: 0.0 },
    outerRing: { common: 19.61, uncommon: 1.96, rare: 78.43, veryRare: 0.0, ultraRare: 0.0 },
  },
  {
    level: 8,
    nodes: { inner: 3, middle: 2, outer: 1 },
    rarityCounts: { common: [0, 6], uncommon: [1, 3], rare: [1, 1], veryRare: [0, 0], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [1, 3], items: [1, 2], addons: [1, 4], mysteryBoxes: [0, 0] },
    innerRing: { common: 76.34, uncommon: 22.9, rare: 0.76, veryRare: 0.0, ultraRare: 0.0 },
    middleRing: { common: 55.56, uncommon: 27.78, rare: 16.67, veryRare: 0.0, ultraRare: 0.0 },
    outerRing: { common: 19.61, uncommon: 1.96, rare: 78.43, veryRare: 0.0, ultraRare: 0.0 },
  },
  {
    level: 9,
    nodes: { inner: 4, middle: 2, outer: 2 },
    rarityCounts: { common: [1, 8], uncommon: [1, 4], rare: [1, 2], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [1, 4], items: [1, 2], addons: [2, 6], mysteryBoxes: [0, 0] },
    innerRing: { common: 75.76, uncommon: 22.73, rare: 0.76, veryRare: 0.76, ultraRare: 0.0 },
    middleRing: { common: 54.95, uncommon: 27.47, rare: 16.48, veryRare: 1.1, ultraRare: 0.0 },
    outerRing: { common: 17.86, uncommon: 1.79, rare: 71.43, veryRare: 8.93, ultraRare: 0.0 },
  },
  {
    level: 10,
    nodes: { inner: 4, middle: 3, outer: 2 },
    rarityCounts: { common: [1, 9], uncommon: [1, 4], rare: [1, 3], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [2, 2], offerings: [1, 5], items: [1, 2], addons: [2, 6], mysteryBoxes: [1, 1] },
    innerRing: { common: 65.79, uncommon: 32.89, rare: 0.66, veryRare: 0.66, ultraRare: 0.0 },
    middleRing: { common: 52.08, uncommon: 31.25, rare: 15.63, veryRare: 1.04, ultraRare: 0.0 },
    outerRing: { common: 1.96, uncommon: 9.8, rare: 78.43, veryRare: 9.8, ultraRare: 0.0 },
  },
  {
    level: 11,
    nodes: { inner: 3, middle: 2, outer: 1 },
    rarityCounts: { common: [0, 6], uncommon: [1, 3], rare: [1, 1], veryRare: [0, 0], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [1, 3], items: [1, 2], addons: [2, 4], mysteryBoxes: [0, 0] },
    innerRing: { common: 66.23, uncommon: 33.11, rare: 0.66, veryRare: 0.0, ultraRare: 0.0 },
    middleRing: { common: 52.63, uncommon: 31.58, rare: 15.79, veryRare: 0.0, ultraRare: 0.0 },
    outerRing: { common: 2.17, uncommon: 10.87, rare: 86.96, veryRare: 0.0, ultraRare: 0.0 },
  },
  {
    level: 12,
    nodes: { inner: 3, middle: 2, outer: 2 },
    rarityCounts: { common: [0, 7], uncommon: [1, 3], rare: [1, 1], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [1, 4], items: [1, 2], addons: [2, 5], mysteryBoxes: [0, 0] },
    innerRing: { common: 65.79, uncommon: 32.89, rare: 0.66, veryRare: 0.66, ultraRare: 0.0 },
    middleRing: { common: 50.0, uncommon: 30.0, rare: 15.0, veryRare: 5.0, ultraRare: 0.0 },
    outerRing: { common: 1.79, uncommon: 8.93, rare: 71.43, veryRare: 17.86, ultraRare: 0.0 },
  },
  {
    level: 13,
    nodes: { inner: 3, middle: 2, outer: 2 },
    rarityCounts: { common: [0, 7], uncommon: [1, 3], rare: [1, 1], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [1, 4], items: [1, 2], addons: [2, 5], mysteryBoxes: [0, 0] },
    innerRing: { common: 65.79, uncommon: 32.89, rare: 0.66, veryRare: 0.66, ultraRare: 0.0 },
    middleRing: { common: 50.0, uncommon: 30.0, rare: 15.0, veryRare: 5.0, ultraRare: 0.0 },
    outerRing: { common: 1.79, uncommon: 8.93, rare: 71.43, veryRare: 17.86, ultraRare: 0.0 },
  },
  {
    level: 14,
    nodes: { inner: 5, middle: 3, outer: 2 },
    rarityCounts: { common: [1, 10], uncommon: [1, 5], rare: [1, 2], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [1, 5], items: [1, 2], addons: [2, 7], mysteryBoxes: [0, 0] },
    innerRing: { common: 65.79, uncommon: 32.89, rare: 0.66, veryRare: 0.66, ultraRare: 0.0 },
    middleRing: { common: 50.0, uncommon: 30.0, rare: 15.0, veryRare: 5.0, ultraRare: 0.0 },
    outerRing: { common: 1.79, uncommon: 8.93, rare: 71.43, veryRare: 17.86, ultraRare: 0.0 },
  },
  {
    level: 15,
    nodes: { inner: 6, middle: 4, outer: 3 },
    rarityCounts: { common: [1, 13], uncommon: [2, 6], rare: [2, 4], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [2, 2], offerings: [1, 7], items: [1, 2], addons: [2, 9], mysteryBoxes: [1, 1] },
    innerRing: { common: 65.79, uncommon: 32.89, rare: 0.66, veryRare: 0.66, ultraRare: 0.0 },
    middleRing: { common: 50.0, uncommon: 30.0, rare: 15.0, veryRare: 5.0, ultraRare: 0.0 },
    outerRing: { common: 1.79, uncommon: 8.93, rare: 71.43, veryRare: 17.86, ultraRare: 0.0 },
  },
  {
    level: 16,
    nodes: { inner: 3, middle: 3, outer: 1 },
    rarityCounts: { common: [0, 7], uncommon: [1, 3], rare: [1, 1], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [2, 4], items: [1, 2], addons: [2, 5], mysteryBoxes: [0, 0] },
    innerRing: { common: 65.79, uncommon: 32.89, rare: 0.66, veryRare: 0.66, ultraRare: 0.0 },
    middleRing: { common: 50.0, uncommon: 30.0, rare: 15.0, veryRare: 5.0, ultraRare: 0.0 },
    outerRing: { common: 1.79, uncommon: 8.93, rare: 71.43, veryRare: 17.86, ultraRare: 0.0 },
  },
  {
    level: 17,
    nodes: { inner: 4, middle: 4, outer: 2 },
    rarityCounts: { common: [1, 10], uncommon: [1, 5], rare: [1, 2], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [2, 5], items: [1, 2], addons: [3, 7], mysteryBoxes: [0, 0] },
    innerRing: { common: 65.79, uncommon: 32.89, rare: 0.66, veryRare: 0.66, ultraRare: 0.0 },
    middleRing: { common: 50.0, uncommon: 30.0, rare: 15.0, veryRare: 5.0, ultraRare: 0.0 },
    outerRing: { common: 1.79, uncommon: 8.93, rare: 71.43, veryRare: 17.86, ultraRare: 0.0 },
  },
  {
    level: 18,
    nodes: { inner: 4, middle: 4, outer: 2 },
    rarityCounts: { common: [1, 10], uncommon: [1, 5], rare: [1, 2], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [2, 5], items: [1, 2], addons: [3, 7], mysteryBoxes: [0, 0] },
    innerRing: { common: 65.79, uncommon: 32.89, rare: 0.66, veryRare: 0.66, ultraRare: 0.0 },
    middleRing: { common: 50.0, uncommon: 30.0, rare: 15.0, veryRare: 5.0, ultraRare: 0.0 },
    outerRing: { common: 1.79, uncommon: 8.93, rare: 71.43, veryRare: 17.86, ultraRare: 0.0 },
  },
  {
    level: 19,
    nodes: { inner: 4, middle: 4, outer: 3 },
    rarityCounts: { common: [1, 11], uncommon: [1, 5], rare: [1, 2], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [2, 6], items: [1, 2], addons: [3, 8], mysteryBoxes: [0, 0] },
    innerRing: { common: 65.79, uncommon: 32.89, rare: 0.66, veryRare: 0.66, ultraRare: 0.0 },
    middleRing: { common: 50.0, uncommon: 30.0, rare: 15.0, veryRare: 5.0, ultraRare: 0.0 },
    outerRing: { common: 1.79, uncommon: 8.93, rare: 71.43, veryRare: 17.86, ultraRare: 0.0 },
  },
  {
    level: 20,
    nodes: { inner: 5, middle: 5, outer: 4 },
    rarityCounts: { common: [1, 14], uncommon: [2, 7], rare: [2, 4], veryRare: [0, 2], ultraRare: [0, 0] },
    itemCounts: { perks: [2, 2], offerings: [2, 7], items: [1, 2], addons: [3, 10], mysteryBoxes: [1, 1] },
    innerRing: { common: 64.1, uncommon: 32.05, rare: 3.21, veryRare: 0.64, ultraRare: 0.0 },
    middleRing: { common: 50.0, uncommon: 30.0, rare: 15.0, veryRare: 5.0, ultraRare: 0.0 },
    outerRing: { common: 1.64, uncommon: 8.2, rare: 65.57, veryRare: 24.59, ultraRare: 0.0 },
  },
  {
    level: 21,
    nodes: { inner: 4, middle: 3, outer: 2 },
    rarityCounts: { common: [1, 9], uncommon: [1, 4], rare: [1, 2], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [2, 5], items: [1, 2], addons: [3, 6], mysteryBoxes: [0, 0] },
    innerRing: { common: 64.1, uncommon: 32.05, rare: 3.21, veryRare: 0.64, ultraRare: 0.0 },
    middleRing: { common: 50.0, uncommon: 30.0, rare: 15.0, veryRare: 5.0, ultraRare: 0.0 },
    outerRing: { common: 1.64, uncommon: 8.2, rare: 65.57, veryRare: 24.59, ultraRare: 0.0 },
  },
  {
    level: 22,
    nodes: { inner: 5, middle: 4, outer: 3 },
    rarityCounts: { common: [1, 12], uncommon: [2, 6], rare: [2, 3], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [2, 6], items: [1, 2], addons: [3, 8], mysteryBoxes: [0, 0] },
    innerRing: { common: 64.1, uncommon: 32.05, rare: 3.21, veryRare: 0.64, ultraRare: 0.0 },
    middleRing: { common: 50.0, uncommon: 30.0, rare: 15.0, veryRare: 5.0, ultraRare: 0.0 },
    outerRing: { common: 1.64, uncommon: 8.2, rare: 65.57, veryRare: 24.59, ultraRare: 0.0 },
  },
  {
    level: 23,
    nodes: { inner: 5, middle: 4, outer: 3 },
    rarityCounts: { common: [1, 12], uncommon: [2, 6], rare: [2, 3], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [2, 6], items: [1, 2], addons: [3, 8], mysteryBoxes: [0, 0] },
    innerRing: { common: 64.1, uncommon: 32.05, rare: 3.21, veryRare: 0.64, ultraRare: 0.0 },
    middleRing: { common: 50.0, uncommon: 30.0, rare: 15.0, veryRare: 5.0, ultraRare: 0.0 },
    outerRing: { common: 1.64, uncommon: 8.2, rare: 65.57, veryRare: 24.59, ultraRare: 0.0 },
  },
  {
    level: 24,
    nodes: { inner: 5, middle: 4, outer: 4 },
    rarityCounts: { common: [1, 13], uncommon: [2, 6], rare: [2, 3], veryRare: [0, 1], ultraRare: [0, 0] },
    itemCounts: { perks: [1, 1], offerings: [2, 7], items: [1, 2], addons: [3, 9], mysteryBoxes: [0, 0] },
    innerRing: { common: 64.1, uncommon: 32.05, rare: 3.21, veryRare: 0.64, ultraRare: 0.0 },
    middleRing: { common: 50.0, uncommon: 30.0, rare: 15.0, veryRare: 5.0, ultraRare: 0.0 },
    outerRing: { common: 1.64, uncommon: 8.2, rare: 65.57, veryRare: 24.59, ultraRare: 0.0 },
  },
  {
    level: 25,
    nodes: { inner: 5, middle: 5, outer: 4 },
    rarityCounts: { common: [1, 14], uncommon: [2, 7], rare: [2, 7], veryRare: [0, 2], ultraRare: [1, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 7], items: [1, 2], addons: [3, 10], mysteryBoxes: [1, 1] },
    innerRing: { common: 63.69, uncommon: 31.85, rare: 3.18, veryRare: 0.64, ultraRare: 0.64 },
    middleRing: { common: 49.5, uncommon: 29.7, rare: 14.85, veryRare: 4.95, ultraRare: 0.99 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 26,
    nodes: { inner: 4, middle: 3, outer: 3 },
    rarityCounts: { common: [1, 10], uncommon: [1, 5], rare: [1, 2], veryRare: [0, 1], ultraRare: [0, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 5], items: [1, 3], addons: [3, 7], mysteryBoxes: [0, 0] },
    innerRing: { common: 63.69, uncommon: 31.85, rare: 3.18, veryRare: 0.64, ultraRare: 0.64 },
    middleRing: { common: 49.5, uncommon: 29.7, rare: 14.85, veryRare: 4.95, ultraRare: 0.99 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 27,
    nodes: { inner: 5, middle: 4, outer: 4 },
    rarityCounts: { common: [1, 13], uncommon: [2, 6], rare: [2, 3], veryRare: [0, 1], ultraRare: [0, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 7], items: [1, 3], addons: [3, 9], mysteryBoxes: [0, 0] },
    innerRing: { common: 63.69, uncommon: 31.85, rare: 3.18, veryRare: 0.64, ultraRare: 0.64 },
    middleRing: { common: 49.5, uncommon: 29.7, rare: 14.85, veryRare: 4.95, ultraRare: 0.99 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 28,
    nodes: { inner: 5, middle: 5, outer: 4 },
    rarityCounts: { common: [1, 14], uncommon: [2, 7], rare: [2, 3], veryRare: [0, 2], ultraRare: [0, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 7], items: [1, 3], addons: [3, 10], mysteryBoxes: [0, 0] },
    innerRing: { common: 63.69, uncommon: 31.85, rare: 3.18, veryRare: 0.64, ultraRare: 0.64 },
    middleRing: { common: 49.5, uncommon: 29.7, rare: 14.85, veryRare: 4.95, ultraRare: 0.99 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 29,
    nodes: { inner: 5, middle: 5, outer: 4 },
    rarityCounts: { common: [1, 14], uncommon: [2, 7], rare: [2, 3], veryRare: [0, 2], ultraRare: [0, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 7], items: [1, 3], addons: [3, 10], mysteryBoxes: [0, 0] },
    innerRing: { common: 63.69, uncommon: 31.85, rare: 3.18, veryRare: 0.64, ultraRare: 0.64 },
    middleRing: { common: 49.5, uncommon: 29.7, rare: 14.85, veryRare: 4.95, ultraRare: 0.99 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 30,
    nodes: { inner: 6, middle: 6, outer: 5 },
    rarityCounts: { common: [2, 17], uncommon: [3, 8], rare: [2, 5], veryRare: [1, 2], ultraRare: [0, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 9], items: [1, 3], addons: [3, 12], mysteryBoxes: [1, 1] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 47.17, uncommon: 28.3, rare: 18.87, veryRare: 4.72, ultraRare: 0.94 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 31,
    nodes: { inner: 5, middle: 4, outer: 4 },
    rarityCounts: { common: [1, 13], uncommon: [2, 6], rare: [2, 3], veryRare: [0, 1], ultraRare: [0, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 7], items: [1, 3], addons: [3, 9], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 47.17, uncommon: 28.3, rare: 18.87, veryRare: 4.72, ultraRare: 0.94 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 32,
    nodes: { inner: 5, middle: 5, outer: 5 },
    rarityCounts: { common: [1, 15], uncommon: [2, 7], rare: [2, 3], veryRare: [1, 2], ultraRare: [0, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 8], items: [1, 3], addons: [3, 10], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 47.17, uncommon: 28.3, rare: 18.87, veryRare: 4.72, ultraRare: 0.94 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 33,
    nodes: { inner: 5, middle: 5, outer: 5 },
    rarityCounts: { common: [1, 15], uncommon: [2, 7], rare: [2, 3], veryRare: [1, 2], ultraRare: [0, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 8], items: [1, 3], addons: [3, 10], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 47.17, uncommon: 28.3, rare: 18.87, veryRare: 4.72, ultraRare: 0.94 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 34,
    nodes: { inner: 6, middle: 5, outer: 5 },
    rarityCounts: { common: [2, 16], uncommon: [2, 8], rare: [2, 4], veryRare: [1, 2], ultraRare: [0, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 8], items: [1, 3], addons: [3, 11], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 47.17, uncommon: 28.3, rare: 18.87, veryRare: 4.72, ultraRare: 0.94 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 35,
    nodes: { inner: 6, middle: 6, outer: 6 },
    rarityCounts: { common: [2, 18], uncommon: [3, 9], rare: [3, 9], veryRare: [1, 2], ultraRare: [1, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 9], items: [1, 3], addons: [3, 12], mysteryBoxes: [1, 1] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 47.17, uncommon: 28.3, rare: 18.87, veryRare: 4.72, ultraRare: 0.94 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 36,
    nodes: { inner: 6, middle: 5, outer: 4 },
    rarityCounts: { common: [1, 15], uncommon: [2, 7], rare: [2, 3], veryRare: [1, 2], ultraRare: [0, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 8], items: [1, 3], addons: [3, 10], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 47.17, uncommon: 28.3, rare: 18.87, veryRare: 4.72, ultraRare: 0.94 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 37,
    nodes: { inner: 6, middle: 5, outer: 5 },
    rarityCounts: { common: [2, 16], uncommon: [2, 8], rare: [2, 4], veryRare: [1, 2], ultraRare: [0, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 8], items: [1, 3], addons: [3, 11], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 47.17, uncommon: 28.3, rare: 18.87, veryRare: 4.72, ultraRare: 0.94 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 38,
    nodes: { inner: 6, middle: 6, outer: 5 },
    rarityCounts: { common: [2, 17], uncommon: [2, 8], rare: [2, 4], veryRare: [1, 2], ultraRare: [0, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 9], items: [1, 3], addons: [3, 12], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 47.17, uncommon: 28.3, rare: 18.87, veryRare: 4.72, ultraRare: 0.94 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 39,
    nodes: { inner: 6, middle: 6, outer: 6 },
    rarityCounts: { common: [2, 18], uncommon: [3, 9], rare: [3, 4], veryRare: [1, 2], ultraRare: [0, 1] },
    itemCounts: { perks: [2, 2], offerings: [2, 9], items: [1, 3], addons: [3, 12], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 44.64, uncommon: 26.79, rare: 17.86, veryRare: 8.93, ultraRare: 1.79 },
    outerRing: { common: 1.56, uncommon: 7.81, rare: 62.5, veryRare: 23.44, ultraRare: 4.69 },
  },
  {
    level: 40,
    nodes: { inner: 6, middle: 7, outer: 7 },
    rarityCounts: { common: [2, 20], uncommon: [4, 10], rare: [4, 10], veryRare: [1, 4], ultraRare: [1, 2] },
    itemCounts: { perks: [3, 3], offerings: [2, 10], items: [1, 3], addons: [3, 14], mysteryBoxes: [1, 1] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 44.64, uncommon: 26.79, rare: 17.86, veryRare: 8.93, ultraRare: 1.79 },
    outerRing: { common: 1.45, uncommon: 7.25, rare: 57.97, veryRare: 28.99, ultraRare: 4.35 },
  },
  {
    level: 41,
    nodes: { inner: 6, middle: 6, outer: 5 },
    rarityCounts: { common: [2, 17], uncommon: [2, 8], rare: [3, 4], veryRare: [1, 4], ultraRare: [0, 1] },
    itemCounts: { perks: [3, 3], offerings: [2, 9], items: [1, 3], addons: [3, 12], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 44.64, uncommon: 26.79, rare: 17.86, veryRare: 8.93, ultraRare: 1.79 },
    outerRing: { common: 1.45, uncommon: 7.25, rare: 57.97, veryRare: 28.99, ultraRare: 4.35 },
  },
  {
    level: 42,
    nodes: { inner: 6, middle: 6, outer: 6 },
    rarityCounts: { common: [2, 18], uncommon: [3, 9], rare: [3, 4], veryRare: [1, 4], ultraRare: [0, 1] },
    itemCounts: { perks: [3, 3], offerings: [2, 9], items: [1, 3], addons: [3, 12], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 44.64, uncommon: 26.79, rare: 17.86, veryRare: 8.93, ultraRare: 1.79 },
    outerRing: { common: 1.45, uncommon: 7.25, rare: 57.97, veryRare: 28.99, ultraRare: 4.35 },
  },
  {
    level: 43,
    nodes: { inner: 6, middle: 7, outer: 6 },
    rarityCounts: { common: [2, 19], uncommon: [3, 9], rare: [3, 4], veryRare: [1, 4], ultraRare: [0, 1] },
    itemCounts: { perks: [3, 3], offerings: [2, 10], items: [1, 3], addons: [3, 13], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 44.64, uncommon: 26.79, rare: 17.86, veryRare: 8.93, ultraRare: 1.79 },
    outerRing: { common: 1.45, uncommon: 7.25, rare: 57.97, veryRare: 28.99, ultraRare: 4.35 },
  },
  {
    level: 44,
    nodes: { inner: 6, middle: 8, outer: 7 },
    rarityCounts: { common: [2, 21], uncommon: [3, 10], rare: [4, 5], veryRare: [1, 4], ultraRare: [0, 1] },
    itemCounts: { perks: [3, 3], offerings: [2, 11], items: [1, 3], addons: [3, 14], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 44.64, uncommon: 26.79, rare: 17.86, veryRare: 8.93, ultraRare: 1.79 },
    outerRing: { common: 1.45, uncommon: 7.25, rare: 57.97, veryRare: 28.99, ultraRare: 4.35 },
  },
  {
    level: 45,
    nodes: { inner: 6, middle: 9, outer: 9 },
    rarityCounts: { common: [3, 24], uncommon: [4, 12], rare: [4, 12], veryRare: [2, 5], ultraRare: [1, 2] },
    itemCounts: { perks: [3, 3], offerings: [2, 12], items: [1, 3], addons: [3, 16], mysteryBoxes: [1, 1] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 44.64, uncommon: 26.79, rare: 17.86, veryRare: 8.93, ultraRare: 1.79 },
    outerRing: { common: 1.45, uncommon: 7.25, rare: 57.97, veryRare: 28.99, ultraRare: 4.35 },
  },
  {
    level: 46,
    nodes: { inner: 6, middle: 8, outer: 8 },
    rarityCounts: { common: [2, 22], uncommon: [3, 11], rare: [4, 5], veryRare: [1, 4], ultraRare: [0, 1] },
    itemCounts: { perks: [3, 3], offerings: [2, 11], items: [1, 3], addons: [3, 15], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 44.64, uncommon: 26.79, rare: 17.86, veryRare: 8.93, ultraRare: 1.79 },
    outerRing: { common: 1.45, uncommon: 7.25, rare: 57.97, veryRare: 28.99, ultraRare: 4.35 },
  },
  {
    level: 47,
    nodes: { inner: 6, middle: 9, outer: 8 },
    rarityCounts: { common: [2, 23], uncommon: [3, 11], rare: [4, 5], veryRare: [1, 4], ultraRare: [0, 1] },
    itemCounts: { perks: [3, 3], offerings: [2, 12], items: [1, 3], addons: [3, 16], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 44.64, uncommon: 26.79, rare: 17.86, veryRare: 8.93, ultraRare: 1.79 },
    outerRing: { common: 1.45, uncommon: 7.25, rare: 57.97, veryRare: 28.99, ultraRare: 4.35 },
  },
  {
    level: 48,
    nodes: { inner: 6, middle: 9, outer: 9 },
    rarityCounts: { common: [3, 24], uncommon: [4, 12], rare: [4, 6], veryRare: [1, 4], ultraRare: [0, 1] },
    itemCounts: { perks: [3, 3], offerings: [2, 12], items: [1, 3], addons: [3, 16], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 44.64, uncommon: 26.79, rare: 17.86, veryRare: 8.93, ultraRare: 1.79 },
    outerRing: { common: 1.45, uncommon: 7.25, rare: 57.97, veryRare: 28.99, ultraRare: 4.35 },
  },
  {
    level: 49,
    nodes: { inner: 6, middle: 10, outer: 9 },
    rarityCounts: { common: [3, 25], uncommon: [4, 12], rare: [5, 6], veryRare: [1, 4], ultraRare: [0, 1] },
    itemCounts: { perks: [3, 3], offerings: [2, 13], items: [1, 3], addons: [3, 17], mysteryBoxes: [0, 0] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 44.64, uncommon: 26.79, rare: 17.86, veryRare: 8.93, ultraRare: 1.79 },
    outerRing: { common: 1.45, uncommon: 7.25, rare: 57.97, veryRare: 28.99, ultraRare: 4.35 },
  },
  {
    level: 50,
    nodes: { inner: 6, middle: 10, outer: 10 },
    rarityCounts: { common: [3, 26], uncommon: [4, 13], rare: [5, 6], veryRare: [2, 6], ultraRare: [0, 1] },
    itemCounts: { perks: [4, 4], offerings: [2, 13], items: [1, 3], addons: [3, 18], mysteryBoxes: [1, 1] },
    innerRing: { common: 61.73, uncommon: 30.86, rare: 6.17, veryRare: 0.62, ultraRare: 0.62 },
    middleRing: { common: 44.64, uncommon: 26.79, rare: 17.86, veryRare: 8.93, ultraRare: 1.79 },
    outerRing: { common: 1.45, uncommon: 7.25, rare: 57.97, veryRare: 28.99, ultraRare: 4.35 },
  },
]

export const UNLOCKABLE_TYPE_ODDS = {
  survivor: { offering: 34.29, item: 17.14, addon: 48.57 },
  survivorWithMysteryBoxes: { offering: 32.43, item: 16.22, addon: 45.95, mysteryBox: 5.41 },
  killer: { offering: 41.38, addon: 58.62 },
  killerWithMysteryBoxes: { offering: 38.71, addon: 54.84, mysteryBox: 6.45 },
}

export interface PrestigeModifier {
  prestige: number
  rareBonus: number
  veryRareBonus: number
  ultraRareBonus: number
}

export const PRESTIGE_MODIFIERS: PrestigeModifier[] = [
  { prestige: 1, rareBonus: 10.00, veryRareBonus: 0.00, ultraRareBonus: 0.00 },
  { prestige: 2, rareBonus: 20.00, veryRareBonus: 10.00, ultraRareBonus: 0.00 },
  { prestige: 3, rareBonus: 30.00, veryRareBonus: 20.00, ultraRareBonus: 10.00 },
]

export const MYSTERY_BOX_ODDS: Record<string, RingOdds> = {
  common: { common: 70.00, uncommon: 30.00, rare: 0.00, veryRare: 0.00, ultraRare: 0.00 },
  uncommon: { common: 0.00, uncommon: 80.00, rare: 20.00, veryRare: 0.00, ultraRare: 0.00 },
  rare: { common: 0.00, uncommon: 0.00, rare: 90.00, veryRare: 10.00, ultraRare: 0.00 },
  veryRare: { common: 0.00, uncommon: 0.00, rare: 0.00, veryRare: 98.00, ultraRare: 2.00 },
  ultraRare: { common: 0.00, uncommon: 0.00, rare: 0.00, veryRare: 0.00, ultraRare: 100.00 },
}

