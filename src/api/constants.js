import http from "./http";

// GET all constants
export const getConstants = () => http.get("/menu-constants");

// UPDATE a constant by key
export const updateConstant = (keyName, keyValue) =>
  http.put(`/constants/${keyName}`, { keyValue });

export const updateConstants = (constants) => {
  return http.post('/menu-constants-bulk', { constants })
}