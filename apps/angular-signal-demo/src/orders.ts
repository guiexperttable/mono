// Test data: orders with a fixed seed (the same rows on every reload – for recordings).
export interface Order {
  id: number;
  customer: string;
  city: string;
  total: number;
}

const CUSTOMERS = ["Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark", "Wayne", "Wonka", "Tyrell", "Cyberdyne"];
const CITIES = ["Berlin", "Hamburg", "München", "Köln", "Frankfurt", "Stuttgart", "Leipzig", "Dresden"];

/** `count` orders – a tiny linear congruential generator, seed 42 */
export function createOrders(count: number): Order[] {
  let seed = 42;
  const next = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    customer: CUSTOMERS[Math.floor(next() * CUSTOMERS.length)],
    city: CITIES[Math.floor(next() * CITIES.length)],
    total: Math.round(next() * 100_000) / 100,
  }));
}
