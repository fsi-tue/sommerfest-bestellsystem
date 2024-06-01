import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import {API_ENDPOINT} from "../globals.js";

export const authApi = createApi({
    reducerPath: 'auth',
    baseQuery: fetchBaseQuery({baseUrl: API_ENDPOINT + '/auth'}),
    endpoints: (builder) => ({
        login: builder.mutation({
            query: ({token}) => ({
                url: 'login',
                method: 'POST',
                body: {token},
            }),
        }),
        logout: builder.mutation({
            query: () => 'logout',
        }),
    }),
})

export const {useLoginMutation, useLogoutMutation} = authApi
