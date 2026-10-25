/** Digits for wa.me links. Pakistani numbers written as 03xx... become 923xx... */
export function waDigits(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "92" + d.slice(1);
  return d;
}
