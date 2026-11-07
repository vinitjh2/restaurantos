/**
 * RestaurantOS Kitchen Station Routing Engine
 * 
 * Automatically routes dishes and items to their designated preparation stations:
 * - Main Kitchen: Curries, Biryani, Starters, Gravies, Tandoori chicken
 * - Bakery: Breads, Naans, Rotis, Parathas, Pastries, Desserts
 * - Bar: Alcoholic drinks, Cocktails, Mocktails, Beers, Wines
 * - Beverage Counter: Chaas, Lassi, Fresh juices, Soft drinks, Tea, Coffee
 */

export type KitchenStation = "Main Kitchen" | "Bar" | "Bakery" | "Beverage Counter";

export const KITCHEN_STATIONS: KitchenStation[] = [
  "Main Kitchen",
  "Bakery",
  "Bar",
  "Beverage Counter",
];

export function resolveItemStation(category: string, itemName: string): KitchenStation {
  const cat = (category || "").toLowerCase();
  const name = (itemName || "").toLowerCase();

  // 1. Bakery Station (Breads & Desserts)
  if (
    cat.includes("bread") ||
    cat.includes("dessert") ||
    cat.includes("bakery") ||
    name.includes("naan") ||
    name.includes("roti") ||
    name.includes("kulcha") ||
    name.includes("paratha") ||
    name.includes("jamun") ||
    name.includes("halwa") ||
    name.includes("cake")
  ) {
    return "Bakery";
  }

  // 2. Bar Station (Alcoholic beverages & Cocktails)
  if (
    cat.includes("bar") ||
    cat.includes("liquor") ||
    cat.includes("cocktail") ||
    cat.includes("beer") ||
    cat.includes("wine") ||
    name.includes("whisky") ||
    name.includes("vodka") ||
    name.includes("beer") ||
    name.includes("gin") ||
    name.includes("cocktail")
  ) {
    return "Bar";
  }

  // 3. Beverage Counter (Non-alcoholic beverages, cooler drinks)
  if (
    cat.includes("beverage") ||
    cat.includes("drink") ||
    cat.includes("juice") ||
    name.includes("chaas") ||
    name.includes("lassi") ||
    name.includes("soda") ||
    name.includes("coffee") ||
    name.includes("tea") ||
    name.includes("shake") ||
    name.includes("water")
  ) {
    return "Beverage Counter";
  }

  // 4. Default: Main Kitchen (Curries, Biryanis, Starters, Tandoor)
  return "Main Kitchen";
}
