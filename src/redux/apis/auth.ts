import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApiSlice = createApi({
    reducerPath: "auth",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://127.0.0.1:2000"
    }),
    endpoints: (builder)=>{
        return {
            signIn: builder.query({
                query: (params)=>({
                    url: "/api/v1/users/login",
                    method: "GET",
                    params: params
                })
            })
        }
    }
})


export const {
    useLazySignInQuery
    

} = authApiSlice