import mongoose from 'mongoose';
import { isDatabaseConnected } from '../config/database.js';
import { getStore } from '../config/memoryStore.js';

const applicationSchema = new mongoose.Schema({
  jobId: { type: String, required: true },
  jobTitle: { type: String, default: '' },
  company: { type: String, default: '' },
  profileType: {
    type: String,
    enum: ['ai_ml', 'software_qa', 'general'],
    required: true,
  },
  status: {
    type: String,
    enum: ['saved', 'applied', 'assessment', 'interview', 'rejected', 'offer', 'withdrawn'],
    default: 'saved',
  },
  matchScore: { type: Number, default: 0 },
  appliedDate: { type: Date },
  applicationUrl: { type: String, default: '' },
  notes: { type: String, default: '' },
  resumeUsed: { type: String, default: '' },
}, { timestamps: true });

applicationSchema.index({ jobId: 1, profileType: 1 }, { unique: true });

const MongooseModel = mongoose.model('Application', applicationSchema);

export function getApplicationModel() {
  if (isDatabaseConnected()) {
    return MongooseModel;
  }
  return getStore('applications');
}

export default MongooseModel;
