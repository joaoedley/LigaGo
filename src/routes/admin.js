const express = require('express');
const router = express.Router();
const { auth, masterOnly } = require('../middleware/auth');
const AdminController = require('../controllers/AdminController');

// Middleware binding
const listEmpresas = (req, res) => AdminController.listEmpresas(req, res);
const createEmpresa = (req, res) => AdminController.createEmpresa(req, res);
const toggleEmpresa = (req, res) => AdminController.toggleEmpresa(req, res);
const deleteEmpresa = (req, res) => AdminController.deleteEmpresa(req, res);
const listAllChampionships = (req, res) => AdminController.listAllChampionships(req, res);
const deleteChampionship = (req, res) => AdminController.deleteChampionship(req, res);

// Company Management
router.get('/companies', auth, masterOnly, listEmpresas);
router.post('/companies', auth, masterOnly, createEmpresa);
router.delete('/companies/:id', auth, masterOnly, deleteEmpresa);
router.patch('/companies/:id/toggle', auth, masterOnly, toggleEmpresa);

// Championship Management
router.get('/all-championships', auth, masterOnly, listAllChampionships);
router.delete('/championships/:id', auth, masterOnly, deleteChampionship);

module.exports = router;
