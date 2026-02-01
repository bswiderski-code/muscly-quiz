// lib/calc.ts
export function calcBMI(kg: number, cm: number) {
  const m = cm / 100
  return +(kg / (m * m)).toFixed(2)
}
export function calcTDEE({
  plec, wzrost, waga, wiek, aktywnosc,
}: { plec?: string; wzrost?: number; waga?: number; wiek?: number; aktywnosc?: string }) {
  if (!plec || !wzrost || !waga || !wiek || !aktywnosc) return 0
  const bmr = plec === 'm'
    ? 10 * waga + 6.25 * wzrost - 5 * wiek + 5
    : 10 * waga + 6.25 * wzrost - 5 * wiek - 161
  const factors: Record<string, number> = { niska: 1.2, srednia: 1.5, wysoka: 1.7, bardzo_wysoka: 1.9 }
  return Math.round(bmr * (factors[aktywnosc] ?? 1.4))
}