router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('admin_token')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/admin/login')
  } else {
    next()
  }
})
