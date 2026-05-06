const express = require('express');
const { Task, Project } = require('../models');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get tasks for a project
router.get('/project/:projectId', requireAuth, async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assigneeId', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task (Admin only)
router.post('/project/:projectId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, description, dueDate, assigneeId } = req.body;
    const task = new Task({
      title,
      description,
      dueDate,
      assigneeId,
      projectId: req.params.projectId
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task status or assignment
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Members can only update status. Admins can update anything.
    if (req.user.role !== 'ADMIN') {
      const allowedUpdates = ['status'];
      const updates = Object.keys(req.body);
      const isValid = updates.every(update => allowedUpdates.includes(update));
      if (!isValid) return res.status(403).json({ error: 'Forbidden: Members can only update status' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assigneeId', 'name email');
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task (Admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user tasks dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'ADMIN') {
      query.assigneeId = req.user._id;
    }
    const tasks = await Task.find(query).populate('projectId', 'name');
    
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      in_progress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      done: tasks.filter(t => t.status === 'DONE').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length
    };
    
    res.json({ stats, tasks });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
