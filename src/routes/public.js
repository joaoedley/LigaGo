const express = require('express');
const router = express.Router();
const PublicController = require('../controllers/PublicController');

router.get('/championships', (req, res) => PublicController.listChampionships(req, res));
router.get('/championships/:id', (req, res) => PublicController.getChampionshipDetails(req, res));
router.get('/categories/:categoryId/standings', (req, res) => PublicController.getStandings(req, res));
router.get('/categories/:categoryId/games', (req, res) => PublicController.getGames(req, res));
router.get('/categories/:categoryId/scorers', (req, res) => PublicController.getScorers(req, res));
router.get('/categories/:categoryId/teams', (req, res) => PublicController.getTeams(req, res));
router.get('/game/:id', (req, res) => PublicController.getGameDetails(req, res));

module.exports = router;
