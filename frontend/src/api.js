// interceptor: request를 intercept해서 올바른 header를 적용해줘서 매번 반복적으로 쓸 필요 없게 해줌
// axios interceptor 사용

import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL // baseURL은 specify하지 않아도 되게 해줌
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) { // adding authorization headers automatically
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api