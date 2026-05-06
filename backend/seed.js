const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Project, Task } = require('./models');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/taskapp');
    console.log('Connected! Clearing existing data...');

    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    console.log('Creating realistic users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan@eazytask.com',
      passwordHash,
      role: 'ADMIN'
    });

    const member1 = await User.create({
      name: 'Priya Patel',
      email: 'priya@eazytask.com',
      passwordHash,
      role: 'MEMBER'
    });

    const member2 = await User.create({
      name: 'Amit Kumar',
      email: 'amit@eazytask.com',
      passwordHash,
      role: 'MEMBER'
    });

    console.log('Creating realistic projects...');
    const project1 = await Project.create({
      name: 'Website Migration to Next.js',
      description: 'Moving the main marketing site from WordPress to Next.js for better SEO and load times.',
      ownerId: admin._id
    });

    const project2 = await Project.create({
      name: 'Client: Apex Logistics Portal',
      description: 'Building the dashboard for the Apex freight tracking application. Deadline is end of month.',
      ownerId: admin._id
    });

    const project3 = await Project.create({
      name: 'SOC2 Compliance Audit',
      description: 'Preparing infrastructure and documentation for the upcoming Q4 security audit.',
      ownerId: admin._id
    });

    console.log('Populating tasks across boards...');
    
    // Project 1 Tasks
    await Task.create([
      { title: 'Setup GitHub Actions', description: 'Configure the CI/CD pipeline for the new Next.js repo.', status: 'DONE', dueDate: new Date(Date.now() - 86400000 * 5), projectId: project1._id, assigneeId: member1._id },
      { title: 'Migrate blog posts', description: 'Export posts from WP database and format as markdown.', status: 'IN_PROGRESS', dueDate: new Date(Date.now() + 86400000 * 2), projectId: project1._id, assigneeId: member2._id },
      { title: 'Fix CSS on contact form', description: 'The submit button is overflowing on mobile screens.', status: 'TODO', dueDate: new Date(Date.now() + 86400000 * 4), projectId: project1._id, assigneeId: member1._id },
      { title: 'Update DNS records', description: 'Point the staging domain to the new Vercel deployment.', status: 'TODO', projectId: project1._id, assigneeId: admin._id }
    ]);

    // Project 2 Tasks
    await Task.create([
      { title: 'Design driver tracking view', description: 'Mockup the map interface showing live truck locations.', status: 'DONE', dueDate: new Date(Date.now() - 86400000 * 2), projectId: project2._id, assigneeId: member2._id },
      { title: 'API integration for routes', description: 'Connect the frontend map to the dispatch API.', status: 'IN_PROGRESS', dueDate: new Date(Date.now() + 86400000 * 1), projectId: project2._id, assigneeId: member1._id },
      { title: 'Client demo call prep', description: 'Put together the slide deck summarizing the sprint progress.', status: 'TODO', dueDate: new Date(Date.now() + 86400000 * 5), projectId: project2._id, assigneeId: admin._id }
    ]);

    // Project 3 Tasks
    await Task.create([
      { title: 'Review AWS IAM policies', description: 'Remove unused roles and enforce MFA across all accounts.', status: 'IN_PROGRESS', dueDate: new Date(Date.now() + 86400000 * 3), projectId: project3._id, assigneeId: member2._id },
      { title: 'Draft disaster recovery plan', description: 'Write up the procedures for database restoration.', status: 'TODO', dueDate: new Date(Date.now() + 86400000 * 7), projectId: project3._id, assigneeId: member1._id }
    ]);

    console.log('Database successfully seeded with realistic usage data!');
    console.log('----------------------------------------------------');
    console.log('Login credentials to test:');
    console.log('Admin: rohan@eazytask.com / password123');
    console.log('Member: priya@eazytask.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
