export function getDailyPassword(): string {
  const now = new Date();
  const year = String(now.getFullYear()).slice(2); // "YY"
  const month = String(now.getMonth() + 1).padStart(2, '0'); // "MM"
  const day = String(now.getDate()).padStart(2, '0'); // "DD"
  const date = `${year}${month}${day}`; // "YYMMDD"

  let ret = '';
  for (const char of date) {
    ret += char.charCodeAt(0).toString();
  }

  // Get last character of ret as int
  let d1 = parseInt(ret[ret.length - 1]);
  d1 *= 7;

  // Get last character of date as int
  let d2 = parseInt(date[date.length - 1]);
  d2 *= 2;

  // Get second last character of ret as int
  let d3 = parseInt(ret[ret.length - 2]);
  d3 *= 3;

  // Get second last character of date as int
  let d4 = parseInt(date[date.length - 2]);
  d4 *= 6;

  const d5 = d2 * d3;

  const password = `${d1}${d2}${d3}${d4}${d5}`;

  if (password.length > 5) {
    return password.slice(0, 5);
  }
  return password;
}