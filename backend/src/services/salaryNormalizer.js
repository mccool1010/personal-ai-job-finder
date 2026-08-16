/**
 * Salary Normalizer
 * Parses various salary formats into a normalized structure.
 * Handles INR (LPA), USD, EUR, GBP formats.
 */

/**
 * Normalize a salary string into a structured object
 * @param {string} salaryStr - Raw salary string
 * @param {string} defaultCurrency - Default currency if not detected
 * @returns {object} { min, max, currency, period, display }
 */
export function normalizeSalary(salaryStr, defaultCurrency = null) {
  if (!salaryStr || typeof salaryStr !== 'string') {
    return { min: null, max: null, currency: null, period: null, display: 'Not disclosed' };
  }

  const str = salaryStr.trim();

  // Try LPA format (Indian): ₹5 LPA, 5-9 LPA, etc.
  const lpaMatch = str.match(/₹?\s*(\d+\.?\d*)\s*[-–to]*\s*(\d+\.?\d*)?\s*(?:LPA|lpa|lakhs?\s*per\s*annum)/i);
  if (lpaMatch) {
    const min = parseFloat(lpaMatch[1]) * 100000;
    const max = lpaMatch[2] ? parseFloat(lpaMatch[2]) * 100000 : min;
    return { min, max, currency: 'INR', period: 'yearly', display: formatSalaryDisplay(min, max, 'INR') };
  }

  // Try INR yearly: ₹500,000, ₹5,00,000
  const inrMatch = str.match(/₹\s*([\d,]+)\s*(?:[-–to]*\s*₹?\s*([\d,]+))?\s*(?:\/?\s*(?:year|yr|annum|p\.?a\.?))?/i);
  if (inrMatch) {
    const min = parseFloat(inrMatch[1].replace(/,/g, ''));
    const max = inrMatch[2] ? parseFloat(inrMatch[2].replace(/,/g, '')) : min;
    return { min, max, currency: 'INR', period: 'yearly', display: formatSalaryDisplay(min, max, 'INR') };
  }

  // Try USD: $70,000, $70K, $70,000/year
  const usdMatch = str.match(/\$\s*([\d,]+\.?\d*)\s*([kK])?\s*(?:[-–to]*\s*\$?\s*([\d,]+\.?\d*)\s*([kK])?)?/i);
  if (usdMatch) {
    let min = parseFloat(usdMatch[1].replace(/,/g, ''));
    if (usdMatch[2]) min *= 1000;
    let max = min;
    if (usdMatch[3]) {
      max = parseFloat(usdMatch[3].replace(/,/g, ''));
      if (usdMatch[4]) max *= 1000;
    }
    return { min, max, currency: 'USD', period: 'yearly', display: formatSalaryDisplay(min, max, 'USD') };
  }

  // Try EUR: €50,000, €50K
  const eurMatch = str.match(/€\s*([\d,]+\.?\d*)\s*([kK])?\s*(?:[-–to]*\s*€?\s*([\d,]+\.?\d*)\s*([kK])?)?/i);
  if (eurMatch) {
    let min = parseFloat(eurMatch[1].replace(/,/g, ''));
    if (eurMatch[2]) min *= 1000;
    let max = min;
    if (eurMatch[3]) {
      max = parseFloat(eurMatch[3].replace(/,/g, ''));
      if (eurMatch[4]) max *= 1000;
    }
    return { min, max, currency: 'EUR', period: 'yearly', display: formatSalaryDisplay(min, max, 'EUR') };
  }

  // Try GBP: £50,000
  const gbpMatch = str.match(/£\s*([\d,]+\.?\d*)\s*([kK])?\s*(?:[-–to]*\s*£?\s*([\d,]+\.?\d*)\s*([kK])?)?/i);
  if (gbpMatch) {
    let min = parseFloat(gbpMatch[1].replace(/,/g, ''));
    if (gbpMatch[2]) min *= 1000;
    let max = min;
    if (gbpMatch[3]) {
      max = parseFloat(gbpMatch[3].replace(/,/g, ''));
      if (gbpMatch[4]) max *= 1000;
    }
    return { min, max, currency: 'GBP', period: 'yearly', display: formatSalaryDisplay(min, max, 'GBP') };
  }

  // Generic number extraction
  const numbers = str.match(/[\d,]+/g);
  if (numbers && numbers.length > 0) {
    const vals = numbers.map(n => parseFloat(n.replace(/,/g, ''))).filter(n => !isNaN(n) && n > 0);
    if (vals.length > 0) {
      const currency = defaultCurrency || 'USD';
      return {
        min: vals[0],
        max: vals[1] || vals[0],
        currency,
        period: 'yearly',
        display: formatSalaryDisplay(vals[0], vals[1] || vals[0], currency),
      };
    }
  }

  return { min: null, max: null, currency: null, period: null, display: 'Not disclosed' };
}

/**
 * Format salary for display
 */
export function formatSalaryDisplay(min, max, currency) {
  if (min === null) return 'Not disclosed';

  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || currency + ' ';

  const format = (val) => {
    if (currency === 'INR') {
      if (val >= 100000) return `${symbol}${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)} LPA`;
      return `${symbol}${val.toLocaleString('en-IN')}`;
    }
    if (val >= 1000) return `${symbol}${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`;
    return `${symbol}${val.toLocaleString()}`;
  };

  if (min === max || !max) return format(min);
  return `${format(min)} – ${format(max)}`;
}

/**
 * Normalize salary from numeric values already present on a job
 */
export function normalizeSalaryFromJob(job) {
  if (job.salaryMin || job.salaryMax) {
    return {
      min: job.salaryMin,
      max: job.salaryMax,
      currency: job.salaryCurrency || 'USD',
      period: 'yearly',
      display: formatSalaryDisplay(job.salaryMin, job.salaryMax, job.salaryCurrency || 'USD'),
    };
  }

  // Try to parse from description
  const descSalary = extractSalaryFromText(job.description || '');
  if (descSalary.min) return descSalary;

  return { min: null, max: null, currency: null, period: null, display: 'Not disclosed' };
}

/**
 * Try to extract salary from job description text
 */
function extractSalaryFromText(text) {
  // Look for common salary patterns
  const patterns = [
    /(?:salary|compensation|pay|ctc)[:\s]*(.{5,50})/i,
    /(?:₹|rs\.?|inr)\s*[\d,]+(?:\s*[-–to]+\s*(?:₹|rs\.?|inr)?\s*[\d,]+)?(?:\s*(?:lpa|lakhs?|k|per\s*annum))?/i,
    /\$\s*[\d,]+(?:k)?\s*(?:[-–to]+\s*\$?\s*[\d,]+(?:k)?)?(?:\s*\/?\s*(?:year|yr))?/i,
    /€\s*[\d,]+(?:k)?\s*(?:[-–to]+\s*€?\s*[\d,]+(?:k)?)?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return normalizeSalary(match[0]);
    }
  }

  return { min: null, max: null, currency: null, period: null, display: 'Not disclosed' };
}
