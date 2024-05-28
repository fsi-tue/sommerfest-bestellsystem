import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const pizzaApi = createApi({
    reducerPath: 'pizza',
    baseQuery: fetchBaseQuery({baseUrl: 'http://localhost:3000/'}),
    endpoints: (builder) => ({
        getPizzas: builder.query({
            query: () => 'pizzas',
        }),
        getOrders: builder.query({
            query: () => ({
                url: 'orders',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
        }),
        updateOrder: builder.mutation({
            query: ({orderNumber, status}) => ({
                url: `orders/${orderNumber}`,
                method: 'PUT',
                body: {status},
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }),
        }),
    }),
})

export const {useGetOrdersQuery, useUpdateOrderMutation} = pizzaApi
