require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { sequelize, Empresa } = require('./models');

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 1000 requests per minute
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads directory setup
const uploadsDir = path.join(__dirname, '../uploads');
const dirs = [
  'teams',
  'news',
  'sponsors',
  'championships/logos',
  'championships/banners'
];
dirs.forEach(dir => {
  const fullPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/company', require('./routes/company'));
app.use('/api/public', require('./routes/public'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  const status = err?.name === 'MulterError' || (typeof err?.message === 'string' && err.message.includes('Arquivo inválido'))
    ? 400
    : 500;
  res.status(status).json({ 
    error: err.message || 'Internal Server Error',
    type: err.name || 'Error'
  });
});

const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    
    try {
      await sequelize.sync({ alter: true });
      console.log('Database synced');
    } catch (syncErr) {
      console.error('Database alter sync failed, attempting standard sync:', syncErr.message);
      // Fallback for SQLite limitations with alter:true
      await sequelize.sync(); 
      console.log('Database synced (standard)');
    }
    
    // Create master admin if not exists
    const master = await Empresa.findOne({ where: { login: 'admin' } });
    if (!master) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Empresa.create({
        nome: 'Admin Master',
        login: 'admin',
        senha: hashedPassword,
        isMaster: true,
        ativo: true
      });
      console.log('Master admin created: admin / admin123');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
