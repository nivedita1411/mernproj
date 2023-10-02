const express = require("express");
const {register,login, followUser, logOut, updatePassword, updateProfile, deleteMyProfile, myProfile,  getAllUsers, forgotPassword, resetPassword, getMyPosts, getUserPosts, getUserProfile} = require("../controllers/user");
const {isAuthenticated} = require("../middleware/auth");



const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logOut);
router.route("/follow/:id").get( isAuthenticated, followUser);
router.route("/update/password").put(isAuthenticated, updatePassword);
router.route("/update/profile").put(isAuthenticated, updateProfile);
router.route("/delete/me").delete(isAuthenticated, deleteMyProfile);
router.route("/me").get(isAuthenticated, myProfile);
router.route("/user/:id").get(isAuthenticated,getUserProfile);
router.route("/users").get(isAuthenticated, getAllUsers);
router.route("/forgot/password").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/my/posts").get(isAuthenticated, getMyPosts);
router.route("/userposts/:id").get(isAuthenticated, getUserPosts);


module.exports = router;