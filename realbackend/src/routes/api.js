const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Auth
const authController = require('../modules/auth/auth.controller');
router.post('/auth/login', authController.login);

// TV (customers)
const tvController = require('../modules/tv/tv.controller');
router.post('/tvs/index', authMiddleware, tvController.index);
router.post('/tvs/pending', authMiddleware, tvController.pending);
router.get('/tvs/get_profiles', authMiddleware, tvController.getProfiles);
router.post('/tvs/create', authMiddleware, tvController.create);
router.get('/tvs/get/:id', authMiddleware, tvController.getById);
router.post('/tvs/update', authMiddleware, tvController.update);
router.post('/tvs/activate', authMiddleware, tvController.activate);
router.post('/tvs/delete', authMiddleware, tvController.destroy);
router.post('/tvs/activate_or_cancel', authMiddleware, tvController.activateOrCancel);

// Profiles
const profileController = require('../modules/profiles/profile.controller');
router.post('/tv_profiles/index', authMiddleware, profileController.index);
router.post('/tv_profiles/create', authMiddleware, profileController.create);
router.get('/tv_profiles/get/:id', authMiddleware, profileController.getById);
router.post('/tv_profiles/update', authMiddleware, profileController.update);
router.post('/tv_profiles/delete', authMiddleware, profileController.delete);

// Streams
const streamController = require('../modules/streams/stream.controller');
router.get('/streams', authMiddleware, streamController.index);
router.post('/streams', authMiddleware, streamController.store);
router.get('/streams/:id', authMiddleware, streamController.show);
router.put('/streams/:id', authMiddleware, streamController.update);
router.delete('/streams/:id', authMiddleware, streamController.destroy);
router.post('/streams/:id/start', authMiddleware, streamController.start);
router.post('/streams/:id/stop', authMiddleware, streamController.stop);

// Stream auth / HLS proxy
const hlsProxyController = require('../modules/streams/hlsProxy.controller');
router.get('/stream/auth', hlsProxyController.auth); // external token auth (simplified)
// router.get('/stream-auth-check/:slug?', hlsProxyController.check);
router.get('/stream-auth-check', hlsProxyController.check);
router.get('/stream-auth-check/:slug', hlsProxyController.check);
router.get('/hls-proxy/:slug/:file', hlsProxyController.proxy);

module.exports = router;