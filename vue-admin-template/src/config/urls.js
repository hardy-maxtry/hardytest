export default {
    
    baseUrl : 'http://139.224.54.234:8082/',
    url_prefix: process.env.ECOM_API,
    ad_list : '/advert/list',
    ad_add : '/advert/add',
    ad_detail : '/advert/detail/',
    ad_edit : '/advert/edit',
    ad_updatestatus : '/advert/update-status',

    device_list : '/device/list-down',
    device_list_full : '/device/list',
    device_init : '/device/device-init',
    device_update : '/device/update',
    device_update_state : '/device/update-state/',

    inventory_list :'/inventory/list',
    
    product_list :'/product/list' ,
    product_detail : '/product/detail/',
    product_edit : '/product/edit',
    product_add : '/product/add',

    schedule_list : '/scheduling/list',
    schedule_add : '/scheduling/add'   ,
    schedule_update_status :'/scheduling/update-status',

    promotion_add: '/promotion/add',
    promotion_list: '/promotion/list',
    promotion_detail: '/promotion/detail/',
    promotion_modify: '/promotion/edit',
    promotion_updatestatus: '/promotion/update-status',

    logon_signin : '/logon/sign-in',
    logon_signout : '/logon/sign-out',

    user_add :'/user/add',
    user_detail :'/user/detail/',
    user_edit :'/user/edit',
    user_list :'/user/list',
    user_updatepassword :'/user/update-password',
    user_updatestatus :'/user/update-status/',
    user_updatepassword2 :'/user/update-self-password',

    order_list :'/order/list',


}