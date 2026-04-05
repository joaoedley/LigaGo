const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const ChampionshipController = require('../controllers/ChampionshipController');
const CampoController = require('../controllers/CampoController');

const uploadsDir = path.join(__dirname, '../../uploads');
const teamsDir = path.join(uploadsDir, 'teams');
const newsDir = path.join(uploadsDir, 'news');
const sponsorsDir = path.join(uploadsDir, 'sponsors');
const championshipsDir = path.join(uploadsDir, 'championships');
const championshipsLogosDir = path.join(championshipsDir, 'logos');
const championshipsBannersDir = path.join(championshipsDir, 'banners');

const makeDiskStorage = (dir) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ext && ext.length <= 10 ? ext : '';
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt}`);
  }
});

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) return cb(new Error('Arquivo inválido: envie uma imagem'));
  cb(null, true);
};

const uploadTeamLogo = multer({ storage: makeDiskStorage(teamsDir), fileFilter: imageFileFilter });
const uploadNewsImage = multer({ storage: makeDiskStorage(newsDir), fileFilter: imageFileFilter });
const uploadSponsorLogo = multer({ storage: makeDiskStorage(sponsorsDir), fileFilter: imageFileFilter });
const uploadChampionshipAssets = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'logo') return cb(null, championshipsLogosDir);
      if (file.fieldname === 'banner') return cb(null, championshipsBannersDir);
      return cb(null, championshipsDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const safeExt = ext && ext.length <= 10 ? ext : '';
      cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt}`);
    }
  }),
  fileFilter: imageFileFilter
});

// --- Championships ---
router.get('/championships', auth, (req, res) => ChampionshipController.listChampionships(req, res));
router.post('/championships', auth, uploadChampionshipAssets.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), (req, res) => ChampionshipController.createChampionship(req, res));
router.delete('/championships/:id', auth, (req, res) => ChampionshipController.deleteChampionship(req, res));

// --- Categories ---
router.get('/championships/:championshipId/categories', auth, (req, res) => ChampionshipController.listCategories(req, res));
router.post('/championships/:championshipId/categories', auth, (req, res) => ChampionshipController.createCategory(req, res));
router.delete('/categories/:id', auth, (req, res) => ChampionshipController.deleteCategory(req, res));

// --- Teams ---
router.get('/categories/:categoryId/teams', auth, (req, res) => ChampionshipController.listTeamsByCategory(req, res));
router.post('/categories/:categoryId/teams', auth, uploadTeamLogo.single('logo'), (req, res) => ChampionshipController.createTeam(req, res));
router.delete('/teams/:id', auth, (req, res) => ChampionshipController.deleteTeam(req, res));

// --- Games ---
router.get('/categories/:categoryId/games', auth, (req, res) => ChampionshipController.listGamesByCategory(req, res));
router.post('/categories/:categoryId/generate-games', auth, (req, res) => ChampionshipController.generateGames(req, res));
router.get('/games/:id/details', auth, (req, res) => ChampionshipController.getGameDetails(req, res));
router.put('/games/:id', auth, (req, res) => ChampionshipController.updateGame(req, res));
router.post('/games/:id/events', auth, (req, res) => ChampionshipController.addGameEvent(req, res));
router.delete('/games/:id/events/:eventId', auth, (req, res) => ChampionshipController.deleteGameEvent(req, res));

// --- Sponsors ---
router.get('/championships/:championshipId/sponsors', auth, (req, res) => ChampionshipController.listSponsors(req, res));
router.post('/championships/:championshipId/sponsors', auth, uploadSponsorLogo.single('logo'), (req, res) => ChampionshipController.createSponsor(req, res));
router.delete('/sponsors/:id', auth, (req, res) => ChampionshipController.deleteSponsor(req, res));

// --- News ---
router.get('/championships/:championshipId/news', auth, (req, res) => ChampionshipController.listNews(req, res));
router.post('/championships/:championshipId/news', auth, uploadNewsImage.single('imagem'), (req, res) => ChampionshipController.createNews(req, res));
router.delete('/news/:id', auth, (req, res) => ChampionshipController.deleteNews(req, res));

// --- Players ---
router.get('/categories/:categoryId/players', auth, (req, res) => ChampionshipController.listPlayersByCategory(req, res));
router.get('/teams/:teamId/players', auth, (req, res) => ChampionshipController.listPlayersByTeam(req, res));
router.post('/teams/:teamId/players', auth, (req, res) => ChampionshipController.createPlayer(req, res));
router.delete('/players/:id', auth, (req, res) => ChampionshipController.deletePlayer(req, res));

// --- Campos ---
router.get('/campos', auth, (req, res) => CampoController.listCampos(req, res));
router.post('/campos', auth, (req, res) => CampoController.createCampo(req, res));
router.delete('/campos/:id', auth, (req, res) => CampoController.deleteCampo(req, res));

module.exports = router;
