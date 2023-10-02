const User = require ("../models/User");
const Post = require("../models/Post"); 
const {sendEmail} = require("../middleware/sendEmail")
const crypto = require("crypto");
const cloudinary = require("cloudinary");

exports.register = async (req, res) => {
    try {

        const {name, email, password, } = req.body;
        let user = await User.findOne({email});

        if(user){
            return res
                .status(400)
                .json({ success:false, message:"User already exists"});
        }

        // const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        //     folder: "avatars",
        // });

        user = await User.create({
            name, 
            email,
            password, 
            // avatar:{public_id:myCloud.public_id, url: myCloud.secure_url},
        });

        const token = await user.generateToken();

        const options = {
            expires:new Date(Date.now() + 90*24*60*60*1000), 
            httpOnly:true,
        };

        res.status(201).cookie("token", token, options,).json({
            success:true,
            user,
            token,
        });
            

    } catch (error) {

        res.status(500).json({
            success:false,
            message: error.message,
        });

    }
};

exports.login = async (req, res) => {
    try{
        const {email , password } = req.body;

        const user = await User.findOne({email}).select("+password");

        if(!user) {
            return res.status(400).json({
                success: false,
                message: "User does not exist"
            })
        }

        const isMatch = await user.matchPassword(password);

        if(!isMatch) {
            return res.status(400).json({
                success:false,
                message:"Incorrect Password"
            })
        }

        const token = await user.generateToken();

        const options = {
            expires:new Date(Date.now() + 90*24*60*60*1000), 
            httpOnly:true,
        };

        res.status(200).cookie("token", token, options,).json({
            success:true,
            user,
            token,
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message : error.message,
        })
    }
};

exports.logOut = async (req,res) => {
    try {

        res.status(200).cookie("token", null, {expires:new Date(Date.now()), httpOnly:true}).json({
            success:true,
            message:"Logged Out"
        });
        
    } catch (error) {

        res.status(500).json({
            success:false,
            message: error.message,
        })
        
    }
}

exports.followUser = async ( req, res) => {
    try {

        const userToFollow = await User.findById(req.params.id);
        const loggedUser = await User.findById(req.user._id);

        if(!userToFollow) {
            return res.status(404).json({
                success:false,
                message:"User does not exist"
            });
        }

        if(loggedUser.following.includes(userToFollow._id)){

            const indexfollowing = loggedUser.following.indexOf(userToFollow._id);
            loggedUser.following.splice(indexfollowing,1);

            const indexfollowers = userToFollow.followers.indexOf(loggedUser._id);
            userToFollow.followers.splice(indexfollowers, 1);

            await loggedUser.save();
            await userToFollow.save();

            res.status(200).json({
                success:true,
                message:"User unfollowed"
            })

        }

        else {

            loggedUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedUser._id);

            await loggedUser.save();
            await userToFollow.save();

            res.status(200).json({
                success:true,
                message:"User followed"
            });

        }
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("password");

        const {oldPassword , newPassword} = req.body;

        if( !oldPassword || !newPassword){
            return res.status(400).json({
                success:false,
                message:"Please provide old password and the new password",
            });
        }

        const isMatch = await user.matchPassword(oldPassword);

        if(!isMatch) {
            return res.status(400).json({
                success:false,
                message: "Incorrect old password"
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success:true,
            message:"Password Updated"
        });
        
    } catch (error) {

        res.status(500).json({
            success:false,
            message: error.message
        })
        
    }
};

exports.updateProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);

        const {name, email, avatar} = req.body;

        if(name){
            user.name = name;
        }
        if(email){
            user.email = email;
        }

        if(avatar){
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);

            const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                folder: "avatars",
            })
            user.avatar.public_id = myCloud.public_id;
            user.avatar.url = myCloud.secure_url;
        }

        await user.save();

        res.status(200).json({
            success:true,
            message:"Profile Updated"
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message,
        });
        
    }
}

exports.deleteMyProfile = async (req,res) => {
    try {
        
        const user = await User.findById(req.user._id);
        const posts = user.posts;
        const followers = user.followers;
        const userId = user._id;
        const following = user.following;

        await cloudinary.v2.uploader.destroy(user.avatar.public_id);

        await user.deleteOne();
        
        //logging out

        res.status(200).cookie("token", null, {expires:new Date(Date.now()), httpOnly:true})

        //removing posts

        for(let i = 0;i<posts.length;i++)
        {
            const post = await Post.findById(posts[i]);
            await cloudinary.v2.uploader.destroy(post.imageUrl.public_id);
            await post.deleteOne();
        }

        //removing user from follower's following

        for(let i = 0; i< followers.length;i++)
        {
            const follower = await User.findById(followers[i]);

            const index = follower.following.indexOf(userId);
            follower.following.splice(index,1);

            await follower.save();

        }

        //removing user from following's followers

        for(let i = 0; i<following.length;i++)
        {
            const follows = await User.findById(following[i]);

            const index = follows.followers.indexOf(userId);
            follows.followers.splice(index,1);

            await follows.save();

        }

        // removing all comments of the user from all posts
        const allPosts = await Post.find();

        for (let i = 0; i < allPosts.length; i++) 
        {
            const post = await Post.findById(allPosts[i]._id);

            for (let j = 0; j < post.comments.length; j++) {
                if (post.comments[j].user === userId) {
                    post.comments.splice(j, 1);
                }
            }
            await post.save();
        }
        // removing all likes of the user from all posts

        for (let i = 0; i < allPosts.length; i++) 
        {
            const post = await Post.findById(allPosts[i]._id);
      
            for (let j = 0; j < post.likes.length; j++) 
            {
              if (post.likes[j] === userId) 
              {
                post.likes.splice(j, 1);
              }
            }
            await post.save();
        }

        res.status(200).json({
            message:true,
            message:"Profile Deleted"
        });
    } catch (error) {

        res.status(500).json({
            success:false,
            message: error.message,
        });
        
    }
}

exports.myProfile = async (req,res) => {
    try {

        const user = await User.findById(req.user._id).populate("posts followers following");

        res.status(200).json({
            success:true,
            user,
        });
        
    } catch (error) {

        res.status(500).json({
            success:false,
            message: error.message,
        });
        
    }
};

exports.getUserProfile = async (req,res) => {
    try {
        const user = await User.findById(req.params.id).populate("posts followers following");

        if(!user) {
            return res.status(404).json({
                success:false,
                message:"User not Found"
            })
        }

        res.status(200).json({
            success:true,
            user,
        });

        
    } catch (error) {

        res.status(500).json({
            success:false,
            message:error.message,
        });
        
    }
};

exports.getAllUsers = async (req,res) => {
    try {

        const users = await User.find();

        res.status(200).json({
            success:true,
            users,
        })
        
    } catch (error) {

        res.status(500).json({
            success:false,
            message:error.message,
        });
        
    }
}

exports.forgotPassword = async (req,res) => {
    try {

        const user = await User.findOne({email:req.body.email});

        if(!user) {
            return res.status(400).json({
                success:false,
                message:"user not found",
            });
        }

        const resetpasswordToken = user.getResetPasswordToken();

        await user.save();

        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetpasswordToken}`;

        const message = `Reset your password by clicking on the link below: \n\n ${resetUrl}`;

        try {

            await sendEmail({
                email:user.email,
                subject: "Reset Password",
                message,
             });

             res.status(200).json({
                success:true,
                message: "Email Sent",
            })
            
        } catch (error) {

            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            res.status(500).json({
                success:false,
                message:error.message,
            });

        }
        
        
    } catch (error) {

        res.status(500).json({
            success:false,
            message:error.message,
        });
        
    }
};

exports.resetPassword = async (req, res) => {
    try {
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
  
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is invalid or has expired",
        });
      }
  
      user.password = req.body.password;
  
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Password Updated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};

exports.getMyPosts = async (req,res) => {
    try {

        const user = await User.findById(req.user._id);

        const posts = [];

        for(let i = 0;i<user.posts.length;i++){
            const post = await Post.findById(user.posts[i]).populate("likes comments.user owner");
            posts.push(post);
        }

        res.status(200).json({
            success:true,
            posts,
        });
        
    } catch (error) {

        res.status(500).json({
            success:false,
            message:error.message,
        });
        
    }
};

exports.getUserPosts = async (req,res) => {
    try {

        const user = await User.findById(req.params.id);

        const posts = [];

        for(let i = 0;i<user.posts.length;i++){
            const post = await Post.findById(user.posts[i]).populate("likes comments.user owner");
            posts.push(post);
        }

        res.status(200).json({
            success:true,
            posts,
        });
        
    } catch (error) {

        res.status(500).json({
            success:false,
            message:error.message,
        });
        
    }
};