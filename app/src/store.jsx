import {configureStore} from '@reduxjs/toolkit'
// Or from '@reduxjs/toolkit/query/react'
import {setupListeners} from '@reduxjs/toolkit/query'

// Services
import {pizzaApi} from './services/pizza.js'
import {authApi} from "./services/auth.js";

export const store = configureStore({
    reducer: {
        // Add the generated reducer as a specific top-level slice
        [pizzaApi.reducerPath]: pizzaApi.reducer,
        [authApi.reducerPath]: authApi.reducer,
    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(pizzaApi.middleware)
            .concat(authApi.middleware),
})

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch)
