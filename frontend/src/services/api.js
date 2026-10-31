import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
})

export const getEvents = () => api.get('/events').then(({ data }) => data)
export const getEvent = (id) => api.get(`/events/${id}`).then(({ data }) => data)
export const createEvent = (formData) => api.post('/events', formData).then(({ data }) => data)
export const updateEvent = (id, formData) =>
  api.put(`/events/${id}`, formData).then(({ data }) => data)
export const deleteEvent = (id) => api.delete(`/events/${id}`)
export const getRegistrations = (id) =>
  api.get(`/events/${id}/registrations`).then(({ data }) => data)
export const registerForEvent = (id, registration) =>
  api.post(`/events/${id}/registrations`, registration).then(({ data }) => data)

export function getErrorMessage(error) {
  return error.response?.data?.message || 'Unable to connect to the server. Please try again.'
}

export default api
