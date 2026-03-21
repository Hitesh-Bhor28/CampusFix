import axios from 'axios'

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor — attach auth token if available
api.interceptors.request.use(
    (config) => {
        // TODO: Attach Clerk session token here
        // const token = await clerk.session?.getToken()
        // config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor — handle common errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
    }
)

export default api
