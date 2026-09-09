// Utility to convert numbers to Indian Rupee Words (Lakh, Crore format)

export function numberToIndianWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return 'Zero Rupees Only';

  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const formatTens = (n: number): string => {
    if (n === 0) return '';
    if (n < 10) return single[n];
    if (n < 20) return double[n - 10];
    const t = tens[Math.floor(n / 10)];
    const u = single[n % 10];
    return u ? `${t} ${u}` : t;
  };

  const formatHundreds = (n: number): string => {
    let str = '';
    const h = Math.floor(n / 100);
    const rest = n % 100;
    if (h > 0) {
      str += `${single[h]} Hundred `;
    }
    if (rest > 0) {
      if (h > 0) str += 'and ';
      str += formatTens(rest);
    }
    return str.trim();
  };

  const integerPart = Math.floor(num);
  let n = integerPart;

  const crore = Math.floor(n / 10000000);
  n %= 10000000;

  const lakh = Math.floor(n / 100000);
  n %= 100000;

  const thousand = Math.floor(n / 1000);
  n %= 1000;

  const hundreds = n;

  let words = '';
  if (crore > 0) words += `${formatHundreds(crore)} Crore `;
  if (lakh > 0) words += `${formatHundreds(lakh)} Lakh `;
  if (thousand > 0) words += `${formatHundreds(thousand)} Thousand `;
  if (hundreds > 0) words += formatHundreds(hundreds);

  words = words.trim();
  return words ? `Indian Rupees ${words} Only` : 'Zero Rupees Only';
}
