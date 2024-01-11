import axios from 'axios';

const HttpClient = () => {
  const TIMEOUT_LIMIT = 300000;
  const axiosInstance = axios.create({
    baseURL: '/api/v1',
    timeout: TIMEOUT_LIMIT,
  });

  return axiosInstance;
};

export default HttpClient;
