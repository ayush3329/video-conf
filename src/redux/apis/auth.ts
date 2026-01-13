import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApiSlice = createApi({
    reducerPath: "auth",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://127.0.0.1:8000"
    }),
    endpoints: (builder)=>{
        return {
            signIn: builder.mutation({
                query: (body)=>({
                    url: "/users/logIn",
                    method: "POST",
                    body: body,
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
            })
        }
    }
})


export const {
    useSignInMutation
    

} = authApiSlice