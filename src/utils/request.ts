import axios from 'axios';

export const request = axios.create();

request.interceptors.response.use(res => res.data);
