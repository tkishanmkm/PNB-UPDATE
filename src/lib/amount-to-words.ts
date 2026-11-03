import * as numberToWords from 'number-to-words';

/** Convert a decimal currency amount to rupees and paise without passing fractions
 * to number-to-words (which expects a whole number).
 */
export function amountToIndianWords(amount: number): string {
  if (!Number.isFinite(amount)) return 'Amount unavailable';

  const totalPaise = Math.round(Math.abs(amount) * 100);
  const rupees = Math.floor(totalPaise / 100);
  const paise = totalPaise % 100;
  const titleCase = (value: string) => value.replace(/\b\w/g, character => character.toUpperCase());

  const rupeeWords = titleCase(numberToWords.toWords(rupees)) + ' Rupees';
  if (paise === 0) return rupeeWords + ' Only';

  const paiseWords = titleCase(numberToWords.toWords(paise)) + ' Paise';
  return rupeeWords + ' and ' + paiseWords + ' Only';
}
