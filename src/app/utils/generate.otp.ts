export function generateOTP(length = 6): string {
  const digits = "0123456789";
  let v = "";
  for (let i = 0; i < length; i++)
    v += digits[Math.floor(Math.random() * digits.length)];
  return v;
}
