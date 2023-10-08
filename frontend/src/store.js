import { configureStore , getDefaultMiddleware } from "@reduxjs/toolkit";
import {allUsersReducer, postOfFollowingReducer, userProfileReducer, userReducer,} from "./Reducers/User";
import { likeReducer, myPostReducer, userPostsReducer } from "./Reducers/Post";

const store = configureStore({

    middleware: getDefaultMiddleware({
        serializableCheck: false,
      }),
    reducer: {
        user: userReducer,
        postOfFollowing : postOfFollowingReducer,
        allUsers: allUsersReducer,
        like: likeReducer,
        myPosts:myPostReducer,
        userProfile: userProfileReducer,
        userPosts:userPostsReducer,
    },
});

export default store;