require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoute');
const dashboardRoutes = require('./routes/dashboardRoute');
const reportRoutes = require('./routes/reportRoute');
const announcementRoutes = require('./routes/announcementRoute');
const superAdminRoutes = require('./routes/superAdminRoute');
const amenityRoutes = require('./routes/amenityRoute');
const hoaAdminRoutes = require('./routes/hoaAdminRoute');
const residentRoutes = require('./routes/residentRoute');

const app = express();
connectDB();

app.use(express.json());
app.use(cors());
app.use("/uploads/receipts", express.static("uploads/receipts"));

// Routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reports', reportRoutes);
app.use('/announcements', announcementRoutes);
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