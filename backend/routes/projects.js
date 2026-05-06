const express = require('express');
const { Project, Task } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all projects
router.get('/', requireAuth, async (req, res) => {
  try {
    const projects = await Project.find().populate('ownerId', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create project (Admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = new Project({
      name,
      description,
      ownerId: req.user._id
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('ownerId', 'name email');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project (Admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project (Admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    // Also delete associated tasks
    await Task.deleteMany({ projectId: req.params.id });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
