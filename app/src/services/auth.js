import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const authApi = createApi({
    reducerPath: 'auth',
    baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:3000/'}),
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
