export default {
    
    baseUrl : 'http://139.224.54.234:8082/',
    url_prefix: process.env.ECOM_API,
    ad_list : '/advert/list',
    ad_add : '/advert/add',
    ad_detail : '/advert/detail/',
    ad_edit : '/advert/edit',
    
    device_list : '/device/list-down',

    product_list :'/product/list' ,
    product_detail : '/product/detail/',
    product_edit : '/product/edit',
    schedule_list : '/scheduling/list',
    schedule_add : '/scheduling/add'   ,
    schedule_update_status :'/scheduling/update-status',

    promotion_add: '/promotion/add',
    promotion_list: '/promotion/list',
    promotion_detail: '/promotion/detail/',
    promotion_modify: '/promotion/edit',

}