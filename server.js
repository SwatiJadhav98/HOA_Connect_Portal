require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoute');
const dashboardRoutes = require('./routes/dashboardRoute');
const communityRoutes = require('./routes/communityRoute');
const paymentRoutes = require('./routes/paymentRoute');
const reportRoutes = require('./routes/reportRoute');
const notificationRoutes = require('./routes/notificationRoute');
const announcementRoutes = require('./routes/announcementRoute');
const adminRoutes = require('./routes/adminRoute');
const complaintRoutes = require('./routes/complaintRoute');
const superAdminRoutes = require('./routes/superAdminRoute');
const amenityRoutes = require('./routes/amenityRoute');
const hoaAdminRoutes = require('./routes/hoaAdminRoute');
const residentRoutes = require('./routes/residentRoute');

const app = express();
connectDB();

app.use(express.json());
// allow frontend origin (Vite default is 5173). Adjust if you use CRA (3000)
// app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(cors());

// Routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/communities', communityRoutes);
app.use('/payments', paymentRoutes);
app.use('/reports', reportRoutes);
app.use('/notifications', notificationRoutes);
app.use('/announcements', announcementRoutes);
app.use('/admin', adminRoutes);
app.use('/complaints', complaintRoutes);
app.use('/superadmin', superAdminRoutes);
app.use('/amenities', amenityRoutes);
app.use('/hoaadmin', hoaAdminRoutes);
app.use('/resident', residentRoutes);

// Global error handler (simple)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));