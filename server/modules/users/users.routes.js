'use strict';

const router = require('express').Router();

const userController = require('./users.controller');

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.remove);
router.post('/:id/save-game', userController.saveGame);
router.get('/:id/saves', userController.getSaves);

module.exports = router;
