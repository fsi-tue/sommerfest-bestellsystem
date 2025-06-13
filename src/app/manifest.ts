import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Tuetops',
        short_name: 'Tuetops',
        description: 'The pizza ordering system for the summerfest of the computer science student council',
        start_url: '/',
        display: 'standalone',
        background_color: '#000080',
        theme_color: '#000000',
    }
}
