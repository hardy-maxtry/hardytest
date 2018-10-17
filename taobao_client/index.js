let vm = new Vue({
    el : '#mfsj-ews',
    data : {
        items : [
            {
                image : 'download.jpg',
                title : '膜法世家绿豆泥浆面膜',
                desc : '这里是商品介绍这里是商品介绍这里是商品介绍这里是商品介绍这里是商品介绍这里是商品介绍',
                promotions : ['0.1元面膜活动'],
                price : 5,
                stock : 1
            },
            {
                image : 'download.jpg',
                title : '膜法世家绿豆泥浆面膜',
                desc : '这里是商品介绍这里是商品介绍这里是商品介绍这里是商品介绍这里是商品介绍这里是商品介绍',
                promotions : ['0.1元面膜活动'],
                price : 20,
                stock : 2
            },
            {
                image : 'download.jpg',
                title : '膜法世家绿豆泥浆面膜',
                desc : '这里是商品介绍这里是商品介绍这里是商品介绍这里是商品介绍这里是商品介绍这里是商品介绍',
                promotions : ['0.1元面膜活动'],
                price : 9.99,
                stock : 3
            }
        ],
        promotions : [
            {
                title : '0.1元面膜活动',
                price : -4.99,
                switch : true,
            }
        ]
    },
    methods : {

    }
});