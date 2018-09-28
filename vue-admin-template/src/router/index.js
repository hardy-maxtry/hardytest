import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: '主页',
    // hidden: true,
    children: [{
      path: 'dashboard',
      name: '主页',
      component: () => import('@/views/dashboard/index'),
      meta: { 
          title: '主页'
        // , icon: 'table' 
      }
    }]
  },

  // {
  //   path: '/example',
  //   component: Layout,
  //   redirect: '/example/table',
  //   name: 'Example',
  //   meta: { title: 'Example', icon: 'example' },
  //   children: [
  //     {
  //       path: 'table',
  //       name: 'Table',
  //       component: () => import('@/views/table/index'),
  //       meta: { title: 'Table', icon: 'table' }
  //     },
  //     {
  //       path: 'tree',
  //       name: 'Tree',
  //       component: () => import('@/views/tree/index'),
  //       meta: { title: 'Tree', icon: 'tree' }
  //     }
  //   ]
  // },

  // {
  //   path: '/form',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'Form',
  //       component: () => import('@/views/form/index'),
  //       meta: { title: 'Form', icon: 'form' }
  //     }
  //   ]
  // },
  {
    path: '/advertisement',
    component: Layout,
    name: '广告管理',
    meta: {
      title: '广告管理'
    },
    children: [
      {
        path: 'index',
        name: '广告列表',
        component: () => import('@/views/advertisement/index'),
        meta: { title: '广告列表' }
      },
      {
        path: 'create',
        name: '广告创建',
        component: () => import('@/views/advertisement/create'),
        meta: { title: '广告创建' }
      },
      {
        path: 'modify',
        name: '广告编辑',
        component: () => import('@/views/advertisement/modify'),
        meta: { title: '广告编辑' },
        hidden : true
      }
    ]
  },
  {
    path: '/product',
    component: Layout,
    name: '商品管理',
    meta: {
      title: '商品管理'
    },
    children: [
      {
        path: 'add',
        name: '新增商品',
        component: () => import('@/views/product/add'),
        meta: { title: '新增商品' }
      },
      {
        path: 'index',
        name: '商品列表',
        component: () => import('@/views/product/index'),
        meta: { title: '商品列表' }
      },
      {
        path: 'schedule',
        name: '查询排期',
        component: () => import('@/views/product/schedule'),
        meta: { title: '商品排期' }
      },
      {
        path: 'create',
        name: '新建排期',
        component: () => import('@/views/product/schedule_create'),
        meta: { title: '新建排期' }
      },
      {
        path: 'modify',
        name: '商品编辑',
        component: () => import('@/views/product/modify'),
        meta: { title: '商品编辑' },
        hidden : true,
      }
    ]
  },
  {
    path: '/promotion',
    component: Layout,
    name: '促销管理',
    meta: {
      title: '促销管理'
    },
    children: [
      // {
      //   path: 'index',
      //   name: '促销列表',
      //   component: () => import('@/views/product/index'),
      //   meta: { title: '促销列表' }
      // },
      {
        path: 'list',
        name: '促销列表',
        component: () => import('@/views/promotion/promotion_list'),
        meta: { title: '促销列表' }
      },
      {
        path: 'create',
        name: '新建促销',
        component: () => import('@/views/promotion/promotion_create'),
        meta: { title: '新建促销' }
      },
      {
        path: 'modify',
        name: '促销编辑',
        component: () => import('@/views/promotion/promotion_modify'),
        meta: { title: '促销编辑' },
        hidden : true,
      }
    ]
  },
  {
    path: '/device',
    component: Layout,
    name: '售货机管理',
    meta: {
      title: '售货机管理'
    },
    children: [
      // {
      //   path: 'index',
      //   name: '促销列表',
      //   component: () => import('@/views/product/index'),
      //   meta: { title: '促销列表' }
      // },
      {
        path: 'list',
        name: '售货机列表',
        component: () => import('@/views/device/device_list'),
        meta: { title: '售货机列表' }
      },
      {
        path: 'add',
        name: '售货机添加',
        component: () => import('@/views/device/device_add'),
        meta: { title: '售货机添加' }
      },
      // {
      //   path: 'modify',
      //   name: '售货机编辑',
      //   component: () => import('@/views/device/device_modify'),
      //   meta: { title: '售货机编辑' },
      //   hidden : true,
      // }
    ]
  },
  // {
  //   path: '/nested',
  //   component: Layout,
  //   redirect: '/nested/menu1',
  //   name: 'Nested',
  //   meta: {
  //     title: 'nested',
  //     icon: 'nested'
  //   },
  //   children: [
  //     {
  //       path: 'menu1',
  //       component: () => import('@/views/nested/menu1/index'), // Parent router-view
  //       name: 'Menu1',
  //       meta: { title: 'menu1' },
  //       children: [
  //         {
  //           path: 'menu1-1',
  //           component: () => import('@/views/nested/menu1/menu1-1'),
  //           name: 'Menu1-1',
  //           meta: { title: 'menu1-1' }
  //         },
  //         {
  //           path: 'menu1-2',
  //           component: () => import('@/views/nested/menu1/menu1-2'),
  //           name: 'Menu1-2',
  //           meta: { title: 'menu1-2' },
  //           children: [
  //             {
  //               path: 'menu1-2-1',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
  //               name: 'Menu1-2-1',
  //               meta: { title: 'menu1-2-1' }
  //             },
  //             {
  //               path: 'menu1-2-2',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
  //               name: 'Menu1-2-2',
  //               meta: { title: 'menu1-2-2' }
  //             }
  //           ]
  //         },
  //         {
  //           path: 'menu1-3',
  //           component: () => import('@/views/nested/menu1/menu1-3'),
  //           name: 'Menu1-3',
  //           meta: { title: 'menu1-3' }
  //         }
  //       ]
  //     },
  //     {
  //       path: 'menu2',
  //       component: () => import('@/views/nested/menu2/index'),
  //       meta: { title: 'menu2' }
  //     }
  //   ]
  // },

  // {
  //   path: 'external-link',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
  //       meta: { title: 'externalLink', icon: 'link' }
  //     }
  //   ]
  // },

  { path: '*', redirect: '/404', hidden: true }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
