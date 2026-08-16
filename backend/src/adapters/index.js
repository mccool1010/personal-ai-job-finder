/**
 * Job Source Adapter Registry
 * Manages all available adapters and provides parallel fetching.
 * 
 * Sources with public APIs/feeds:
 * - Adzuna (API key required)
 * - Remotive (free, no auth)
 * - Arbeitnow (free, no auth)
 * - RemoteOK (free, no auth)
 * - Himalayas (free, no auth)
 * - WeWorkRemotely (RSS, no auth)
 * - 4DayWeek (free, no auth)
 * - Jobspresso (RSS, no auth)
 * - Greenhouse ATS (public board API, no auth)
 * - Lever ATS (public postings API, no auth)
 */

import { AdzunaAdapter } from './AdzunaAdapter.js';
import { RemotiveAdapter } from './RemotiveAdapter.js';
import { ArbeitnowAdapter } from './ArbeitnowAdapter.js';
import RemoteOKAdapter from './RemoteOKAdapter.js';
import HimalayasAdapter from './HimalayasAdapter.js';
import WeWorkRemotelyAdapter from './WeWorkRemotelyAdapter.js';
import FourDayWeekAdapter from './FourDayWeekAdapter.js';
import JobspressoAdapter from './JobspressoAdapter.js';
import GreenhouseAdapter from './GreenhouseAdapter.js';
import LeverAdapter from './LeverAdapter.js';

// Class-based adapters (original)
const classAdapters = [
  new AdzunaAdapter(),
  new RemotiveAdapter(),
  new ArbeitnowAdapter(),
];

// Simple adapters (new — always available, no auth needed)
const simpleAdapters = [
  RemoteOKAdapter,
  HimalayasAdapter,
  WeWorkRemotelyAdapter,
  FourDayWeekAdapter,
  JobspressoAdapter,
  GreenhouseAdapter,
  LeverAdapter,
];

/**
 * Unified adapter interface wrapper
 */
function wrapSimpleAdapter(adapter) {
  return {
    sourceName: adapter.displayName || adapter.name,
    isAvailable: true,
    fetchJobs: (query, options) => adapter.fetchJobs(query, options),
  };
}

/**
 * Get all available (properly configured) adapters
 */
export function getAvailableAdapters() {
  const classAvailable = classAdapters.filter(a => a.isAvailable);
  const simpleWrapped = simpleAdapters.map(wrapSimpleAdapter);
  const all = [...classAvailable, ...simpleWrapped];
  console.log(`📡 ${all.length} job source adapters available: ${all.map(a => a.sourceName).join(', ')}`);
  return all;
}

/**
 * Fetch jobs from all available sources in parallel.
 * @param {string} query - Search query
 * @param {object} options - Adapter-specific options
 * @returns {Array} Merged array of normalized jobs
 */
export async function fetchFromAllSources(query, options = {}) {
  const available = getAvailableAdapters();
  if (available.length === 0) {
    console.warn('⚠️  No job source adapters available!');
    return [];
  }

  const results = await Promise.allSettled(
    available.map(adapter => adapter.fetchJobs(query, options))
  );

  const allJobs = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`  ✅ ${available[index].sourceName}: ${result.value.length} jobs`);
      allJobs.push(...result.value);
    } else {
      console.error(`  ❌ ${available[index].sourceName}: ${result.reason?.message || 'Unknown error'}`);
    }
  });

  return allJobs;
}

export { classAdapters as adapters };
