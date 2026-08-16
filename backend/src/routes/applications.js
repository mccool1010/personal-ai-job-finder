/**
 * Application Routes
 * Track saved/applied/interview/etc. job applications.
 */

import { Router } from 'express';
import { getApplicationModel } from '../models/Application.js';

const router = Router();

/**
 * GET /api/applications — List all applications
 */
router.get('/', async (req, res) => {
  try {
    const { status, profileType } = req.query;
    const AppModel = getApplicationModel();

    const filter = {};
    if (status) filter.status = status;
    if (profileType) filter.profileType = profileType;

    let apps = await AppModel.find(filter);
    // Resolve the query chain — handle both Mongoose and in-memory results
    if (apps && typeof apps.lean === 'function') {
      apps = await apps.lean();
    } else if (apps && typeof apps.then === 'function') {
      apps = await apps;
    }
    const finalData = Array.isArray(apps) ? apps : [];
    // Sort by updatedAt descending
    finalData.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));

    res.json({ success: true, applications: finalData });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/applications — Save or apply to a job
 */
router.post('/', async (req, res) => {
  try {
    const { jobId, jobTitle, company, profileType, status, matchScore, applicationUrl, notes, resumeUsed } = req.body;

    if (!jobId || !profileType) {
      return res.status(400).json({ success: false, error: 'jobId and profileType are required' });
    }

    const AppModel = getApplicationModel();

    // Check if already exists
    const existing = await AppModel.findOne({ jobId, profileType });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Already tracked this job with this profile',
        application: existing,
      });
    }

    const application = await AppModel.create({
      jobId,
      jobTitle: jobTitle || '',
      company: company || '',
      profileType,
      status: status || 'saved',
      matchScore: matchScore || 0,
      appliedDate: status === 'applied' ? new Date() : null,
      applicationUrl: applicationUrl || '',
      notes: notes || '',
      resumeUsed: resumeUsed || profileType,
    });

    res.status(201).json({ success: true, application });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/applications/:id — Update application status
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };

    // Set applied date when status changes to 'applied'
    if (update.status === 'applied' && !update.appliedDate) {
      update.appliedDate = new Date();
    }

    const AppModel = getApplicationModel();
    const application = await AppModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    res.json({ success: true, application });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/applications/:id — Remove tracked application
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const AppModel = getApplicationModel();
    await AppModel.findByIdAndDelete(id);
    res.json({ success: true, message: 'Application removed' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/applications/check/:jobId — Check if already applied
 */
router.get('/check/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const AppModel = getApplicationModel();
    const existing = await AppModel.findOne({ jobId });
    res.json({
      success: true,
      exists: !!existing,
      application: existing,
    });
  } catch (error) {
    console.error('Error checking application:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
