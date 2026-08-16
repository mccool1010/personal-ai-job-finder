import mongoose from 'mongoose';
import { isDatabaseConnected } from '../config/database.js';
import { getStore } from '../config/memoryStore.js';

const jobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  country: { type: String, default: '' },
  remote: {
    type: String,
    enum: ['onsite', 'remote_india', 'remote_worldwide', 'remote_region', 'remote_us_only', 'remote_eu_only', 'hybrid', 'unknown'],
    default: 'unknown',
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'unknown'],
    default: 'unknown',
  },
  experienceMin: { type: Number, default: null },
  experienceMax: { type: Number, default: null },
  salaryMin: { type: Number, default: null },
  salaryMax: { type: Number, default: null },
  salaryCurrency: { type: String, default: null },
  skills: [{ type: String }],
  postedDate: { type: Date },
  source: { type: String, required: true },
  sourceUrl: { type: String, default: '' },
  applicationUrl: { type: String, default: '' },
  companyType: {
    type: String,
    enum: ['startup', 'mnc', 'mid-size', 'unknown'],
    default: 'unknown',
  },
  deduplicationHash: { type: String, index: true },
  allSources: [{
    source: String,
    url: String,
  }],
  classifiedLocation: { type: String, default: '' },
  classifiedRemote: { type: String, default: '' },
  requiresAuthorization: { type: Boolean, default: false },
  visaSponsorship: { type: Boolean, default: false },
  indiaEligible: { type: Boolean, default: true },
  fetchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

jobSchema.index({ fetchedAt: 1 });
jobSchema.index({ skills: 1 });

const MongooseModel = mongoose.model('Job', jobSchema);

export function getJobModel() {
  if (isDatabaseConnected()) {
    return MongooseModel;
  }
  return getStore('jobs');
}

export default MongooseModel;
