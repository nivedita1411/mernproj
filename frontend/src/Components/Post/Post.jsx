import React, { useEffect, useState } from 'react';
import "./Post.css"
import { Avatar, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import {MoreVert,Favorite,FavoriteBorder,ChatBubbleOutline,DeleteOutline} from "@mui/icons-material";
import { useDispatch, useSelector } from 'react-redux';
import { likePost } from '../../Actions/Post';


const Post = ({
    postId,
    caption,
    postImage,
    likes = [],
    comments = [],
    ownerImage,
    ownerName,
    ownerId,
    isDelete = false,
    isAccount = false,

}) => {

    const [liked,setLiked] = useState(false);
    

    const dispatch = useDispatch();

    const {user} = useSelector(state => state.user)
    

    const handleLike = () => {
        setLiked(!liked);

        dispatch(likePost(postId));

    };

    useEffect (() => {
        likes.forEach(item => {
            if(item._id === user._id){
                setLiked(true);
            }
        });
    },[likes,user._id])



  return (
    <div className='post'>

        <div className="postHeader">
            {
                isAccount ? (
                    <Button>
                        <MoreVert />
                    </Button>
                ) : null
            }
        </div>
        <img src = {postImage} alt = "Post" />

        <div className="postDetails">
            <Avatar src = {ownerImage} alt = "User" sx = {{height:"3vmax", width:"3vmax"}} />

            <Link to = {`/user/${ownerId}`} >
                <Typography fontWeight={700} > {ownerName} </Typography>
            </Link>

            <Typography
                fontWeight={100}
                color="rgba(0,0,0,0.582)"
                style = {{alignSelf: "center"}}
            >
                {caption}
            </Typography>

        </div>

        <button 
            style = {{
                border: "none",
                backgroundColor:"white",
                cursor:"pointer",
                margin: "1vmax 2vmax",
            }}
         
        >
            <Typography> {likes.length} Likes</Typography>

        </button>

        <div className="postFooter">

            <Button onClick= {handleLike} >
                {
                    liked? <Favorite style = {{color:"red"}} /> : <FavoriteBorder />
                }
            </Button>

            <Button>
                <ChatBubbleOutline />
            </Button>

            {
                isDelete ? (
                    <Button>
                        <DeleteOutline />
                    </Button>
                ) : null
            }


        </div>

        
      
    </div>
  )
}

export default Post
