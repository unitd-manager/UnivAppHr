import axios from 'axios'

const api = axios.create({
baseURL: 'https://univhr.unitdtechnologies.com:3005',
//baseURL: 'http://66.29.154.85:3004',
});

export default api