const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const { check, validationResult } = require('express-validator');

const { auth } = require('../../middleware/auth');
const { trim } = require('../../middleware/helpers');
const { User } = require('../../models/User');
const { Profile } = require('../../models/Profile');

// @route  GET api/profile/me
// @desc   Get User Profile
// @access Private
router.get('/me', auth, async (req, res) => {

    try {

        // Find profile of the User using userId
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['fullName', 'avatar'], User);

        if (! profile) {
            return res.status(400).json({ errors: [{ msg: 'Profile is not found for this user'}] });
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// @route  POST api/profile
// @desc   Create or Update User Profile
// @access Private
router.post('/', [auth, trim, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills.*', 'Skills are required').isLength({ min: 1 })
]], async (req, res) => {

    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        let profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
            // Update User's Profile
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: req.body },
                { new: true } // To override existing fields and values
            );
            return res.json({ profile });
        }

        const profileFields = new Profile(req.body);
        profileFields.user = req.user.id;

        profile = await profileFields.save();
        res.json({ profile });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// @route  GET api/profile
// @desc   Get All Profile
// @access Public
router.get('/', async (req, res) => {

    try {

        // Alternative: .populate('user', ['fullName', 'avatar'], User)
        const profiles = await Profile.find().populate('user', 'fullName avatar', User);
        res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// @route  GET api/profile/user/:user_id
// @desc   Get Profile by User ID
// @access Public
router.get('/user/:user_id', async (req, res) => {

    try {

        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', 'fullName avatar', User);
        
        if (! profile) {
            return res.status(404).json({ errors: [{ msg: 'Profile is not found for this user'}] });
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'Profile is not found for this user'}] });
        }
        res.status(500).send('Internal Server Error');
    }
});

// @route  DELETE api/profile
// @desc   Get Profile, User & Posts
// @access Private
router.delete('/', auth, async (req, res) => {

    try {

        //TODO: Remove Users Posts
        await Profile.findOneAndRemove({ user: req.user.id });
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User deleted successfully'});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// @route  PUT api/profile/experience
// @desc   Add Profile experience
// @access Private
router.put('/experience', [auth, trim, [
    check('req.body.*.title', 'Title is required').not().isEmpty(),
    check('req.body.*.from', 'From date is required').not().isEmpty(),
    check('req.body.*.company', 'Company are required').not().isEmpty()
]], async (req, res) => {

    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.push.apply(profile.experience, req.body);
        await profile.save();
        res.json(profile);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// @route  DELETE api/profile/experience/:exp_id
// @desc   Delete experience from Profile
// @access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {

    try {

        const profile = await Profile.findOne({ user: req.user.id });

        // Delete experience by index
        const experienceIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(experienceIndex, 1);
        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'Experience is not found for this user'}] });
        }
        res.status(500).send('Internal Server Error');
    }
});

// @route  PUT api/profile/education
// @desc   Add Profile education
// @access Private
router.put('/education', [auth, trim, [
    check('req.body.*.school', 'School is required').not().isEmpty(),
    check('req.body.*.fieldOfStudy', 'Field of study is required').not().isEmpty(),
    check('req.body.*.from', 'From date is required').not().isEmpty(),
    check('req.body.*.degree', 'Degree are required').not().isEmpty()
]], async (req, res) => {

    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.push.apply(profile.education, req.body);
        await profile.save();
        res.json(profile);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// @route  DELETE api/profile/education/:edu_id
// @desc   Delete education from Profile
// @access Private
router.delete('/education/:edu_id', auth, async (req, res) => {

    try {

        const profile = await Profile.findOne({ user: req.user.id });

        // Delete education by index
        const educationIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(educationIndex, 1);
        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') {
            return res.status(404).json({ errors: [{ msg: 'Education is not found for this user'}] });
        }
        res.status(500).send('Internal Server Error');
    }
});

// @route  GET api/profile/github/:username
// @desc   Delete education from Profile
// @access Public
router.get('/github/:username', (req, res) => {

    try {

        const baseUrl = 'https://api.github.com/';
        const userName = `users/${req.params.username}/`;
        const reposPP = 'repos?per_page=2';
        const sort = 'sort=created:asc';
        const client_id = `client_id=${config.get('githubClientId')}`;
        const client_secret = `client_secret=${config.get('githubSecret')}`;
        
        const options = {
            uri: baseUrl + userName + reposPP + '&' + sort + '&' + client_id + '&' + client_secret,
            method: 'GET',
            headers: { 'user-agent': 'node.js' } // To avoid any issues
        };

        // API to hit github and get user data
        request(options, (error, response, body) => {

            if (error) console.error(error);

            if (response.statusCode !== 200) {
                return res.status(404).json({ msg: 'No Gihub profile found' });
            }

            res.json(JSON.parse(body));
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;