import http from "./http";

// GET all items
export const getItems = () => http.get("/items");

export const getItem = (id) => http.get(`/items/${id}`);

// CREATE item
export const createItem = (item) => http.post("/items", item);

export const updateItem = (item) => {
  const id = item.get('id');
  
  // Remove id from FormData to avoid confusion
  item.delete('id');
  
  // Add method spoofing for Laravel
  item.append('_method', 'PUT');
  
  console.log('Updating item ID:', id);
  
  // Use POST with _method spoofing
  return http.post(`/items/${id}`, item);
};
// DELETE item
export const deleteItem = (id) => http.delete(`/items/${id}`);
