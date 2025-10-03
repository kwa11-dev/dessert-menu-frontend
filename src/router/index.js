import { createRouter, createWebHistory } from 'vue-router'

// Pages
import MenuView from '@/views/public/MenuView.vue'
import AdminLogin from '@/views/admin/Login.vue'

const routes = [
    {
        path: '/',
        name: 'menu',
        component: MenuView, // public dessert menu
    },
    {
        path: '/admin/login',
        name: 'admin-login',
        component: AdminLogin,
    },
    {
        path: '/admin',
        component: () => import('@/views/admin/AdminLayout.vue'),
        children: [
            {
                path: 'items',
                name: 'AdminItems',
                component: () => import('@/views/admin/ItemsManagement.vue'),
            },
            {
                path: 'items/new',
                name: 'CreateItem',
                component: () => import('@/views/admin/ItemForm.vue'),
            },
            {
                path: 'items/edit/:id',
                name: 'EditItem',
                component: () => import('@/views/admin/ItemForm.vue'),
                props: true,
            },
            {
                path: 'categories',
                name: 'AdminCategories',
                component: () => import('@/views/admin/CategoriesManagement.vue'),
            },
            {
                path: 'categories/new',
                name: 'CreateCategory',
                component: () => import('@/views/admin/CategoryForm.vue'),
            },
            {
                path: 'categories/edit/:id',
                name: 'EditCategory',
                component: () => import('@/views/admin/CategoryForm.vue'),
                props: true,
            },
            {
                path: 'constants',
                name: 'AdminConstants',
                component: () => import('@/views/admin/ConstantsManagement.vue'),
            },
            {
                path: '',
                redirect: '/admin/items',
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Example navigation guard for admin routes
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('admin_token') // 🔑 adjust later
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/admin/login')
    } else {
        next()
    }
})

export default router
