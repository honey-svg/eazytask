# EazyTask - Project Management Application

EazyTask is a modern, enterprise-grade project management application designed to help teams collaborate, track tasks, and monitor project velocity in real-time. It features a beautiful dark-mode interface, drag-and-drop Kanban boards, and data visualization.

## 🚀 Features

- **Secure Authentication:** JWT-based role authentication (Admins vs. Members).
- **Interactive Kanban Boards:** Full drag-and-drop capability.
- **Advanced Data Visualization:** Real-time metrics and velocity tracking.
- **Premium UI/UX:** Built with Framer Motion transitions, strict Zod form validation, and glassmorphism styling.
- **Role-Based Access:** Admins can manage projects and assign tasks; Members can view and update their assigned workflow.

## 💻 Tech Stack

- **Frontend:** React (Vite), React Router, Framer Motion, Recharts, React Hook Form + Zod, React Hot Toast.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose ORM).
- **Architecture:** Full-stack Monorepo configuration.

## 🛠️ Local Development

1. **Clone the repository**
2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```
3. **Set up Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=mongodb://localhost:27017/eazytask
   JWT_SECRET=your_super_secret_jwt_key_here
   ```
4. **Seed the database (Optional but recommended):**
   ```bash
   node backend/seed.js
   ```
5. **Run the development servers concurrently:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173` and the backend will run on `http://localhost:5000`.
