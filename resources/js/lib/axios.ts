import axios from 'axios';

axios.defaults.baseURL = (window as any).APP_BASE_URL?.replace(/\/$/, '') ?? '';

export default axios;
