import api from "./http";

export const adminLogin = (credentials) => api.post("/admin/login", credentials);
export const adminLogout = () => api.post("/admin/logout");
