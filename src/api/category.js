import http from "./http";

// GET all categories
export const getCategories = () => http.get("/categories");

export const getCategory = (id) => http.get(`/categories/${id}`);

// CREATE category
export const createCategory = (category) => http.post("/categories", category);

// UPDATE category
export const updateCategory = (category) => {
  const id = category.get('id');
  category.delete('id');
  category.append('_method', 'PUT');
  http.post(`/categories/${id}`, category);
}

// DELETE category
export const deleteCategory = (id) => http.delete(`/categories/${id}`);
