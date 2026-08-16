import mongoose from 'mongoose';
import { isDatabaseConnected } from '../config/database.js';
import { getStore } from '../config/memoryStore.js';

const resumeProfileSchema = new mongoose.Schema({
  profileType: {
    type: String,
    enum: ['ai_ml', 'software_qa', 'general'],
    required: true,
    unique: true,
  },
  name: { type: String, default: '' },
  skills: [{ type: String }],
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String,
  }],
  education: [{
    degree: String,
    institution: String,
    year: String,
    field: String,
  }],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
  }],
  certifications: [{ type: String }],
  achievements: [{ type: String }],
  internships: [{
    title: String,
    company: String,
    duration: String,
    description: String,
  }],
  technologies: [{ type: String }],
  preferredLocations: [{ type: String }],
  preferredRoles: [{ type: String }],
  experienceLevel: {
    type: String,
    enum: ['fresher', '0-2', '1-3', '3-5', '5+'],
    default: 'fresher',
  },
  rawText: { type: String, default: '' },
  fileName: { type: String, default: '' },
  parsedAt: { type: Date },
}, { timestamps: true });

const MongooseModel = mongoose.model('ResumeProfile', resumeProfileSchema);

export function getResumeProfileModel() {
  if (isDatabaseConnected()) {
    return MongooseModel;
  }
  return getStore('resumeProfiles');
}

export default MongooseModel;
