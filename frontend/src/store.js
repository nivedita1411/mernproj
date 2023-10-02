import { configureStore , getDefaultMiddleware } from "@reduxjs/toolkit";
import {allUsersReducer, postOfFollowingReducer, userReducer,} from "./Reducers/User";
import { likeReducer } from "./Reducers/Post";

const store = configureStore({

    middleware: getDefaultMiddleware({
        serializableCheck: false,
      }),
    reducer: {
        user: userReducer,
        postOfFollowing : postOfFollowingReducer,
        allUsers: allUsersReducer,
        like: likeReducer,
    },
});

export default store;