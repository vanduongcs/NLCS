import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:2025/api'
})

export default API