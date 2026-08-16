/**
 * Profile Routes
 * CRUD operations for resume profiles + file upload
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getResumeProfileModel } from '../models/ResumeProfile.js';
import { parseResume } from '../services/resumeParser.js';
import config from '../config/index.js';
import { PROFILE_TARGET_ROLES } from '../data/companyLists.js';

const router = Router();

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxUploadSize },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.docx') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
});

/**
 * GET /api/profiles — List all profiles
 */
router.get('/', async (req, res) => {
  try {
    const ProfileModel = getResumeProfileModel();
    let profiles = await ProfileModel.find({});
    if (profiles && typeof profiles.lean === 'function') {
      profiles = await profiles.lean();
    } else if (profiles && typeof profiles.then === 'function') {
      profiles = await profiles;
    }
    const data = Array.isArray(profiles) ? profiles : [];
    res.json({ success: true, profiles: data });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/profiles/:type — Get a specific profile
 */
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    if (!['ai_ml', 'software_qa', 'general'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid profile type' });
    }

    const ProfileModel = getResumeProfileModel();
    const profile = await ProfileModel.findOne({ profileType: type });
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/profiles/upload — Upload resume and create/update profile
 */
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const profileType = req.body.profileType || 'ai_ml';
    if (!['ai_ml', 'software_qa', 'general'].includes(profileType)) {
      return res.status(400).json({ success: false, error: 'Invalid profile type' });
    }

    // Parse the resume
    const parsed = await parseResume(req.file.path, profileType);

    // Add target roles based on profile type
    parsed.preferredRoles = PROFILE_TARGET_ROLES[profileType] || [];

    const ProfileModel = getResumeProfileModel();

    // Upsert profile
    const profile = await ProfileModel.findOneAndUpdate(
      { profileType },
      {
        ...parsed,
        fileName: req.file.originalname,
        parsedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      profile,
      message: `Profile ${profileType} created/updated successfully from ${req.file.originalname}`,
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/profiles/:type — Update profile manually
 */
router.put('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    if (!['ai_ml', 'software_qa', 'general'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid profile type' });
    }

    const ProfileModel = getResumeProfileModel();
    const profile = await ProfileModel.findOneAndUpdate(
      { profileType: type },
      { $set: req.body },
      { upsert: true, new: true }
    );

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/profiles/:type — Delete a profile
 */
router.delete('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const ProfileModel = getResumeProfileModel();
    await ProfileModel.deleteMany({ profileType: type });
    res.json({ success: true, message: `Profile ${type} deleted` });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
