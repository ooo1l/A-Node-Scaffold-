import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/a',
            name: 'a',
            component: () => import('./views/a.vue')
        },
        {
            path: '/b',
            name: 'b',
            component: () => import('./views/b.vue')
        },
        {
            path: '/c',
            name: 'c',
            component: () => import('./views/c.vue')
        },
        {
            path: '/d',
            name: 'd',
            component: () => import('./views/D.vue')
        },
    ]
})