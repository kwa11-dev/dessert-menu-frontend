export function adminGuard(to, from, next) {
  const token = localStorage.getItem("token");
  if (!token) {
    next("/admin/login");
  } else {
    next();
  }
}
