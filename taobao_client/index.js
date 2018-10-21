const ewsUrl = "https://mfsjst.ewssh.m.jaeapp.com/ews_shoutao/index.html";
// const ewsUrl = "http://localhost:9001/";
const rootUrl = "api/";

function getUrlParam(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    let results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function toUrlParams(params) {
    return Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
    }).join('&');
}

function getUrl(url, params) {
    return axios.get(rootUrl + url, {
        params: params
    });
}

function postUrl(url,params){
    return axios.post(rootUrl + url, params);
}

function urlencode (str) {  
    str = (str + '').toString();   

    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').  
    replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');  
} 

let vm = new Vue({
    el: '#mfsj-ews',
    data: {
        items: [],
        promotions: [],
        // orderId: '7a2c4402-b187-4725-b7c1-952e21bad080',
        orderId: '',
        // deviceNo: 'AD4278BFBB',
        isAuth: false,
        nick: '',
        isPaid : false,
        isMember: false,
    },
    created() {
        Tida.showLoading("膜法世家欢迎您!");
        this.orderId = getUrlParam("order_id");
        this.nick = getUrlParam("nick");
        // this.refreshOrder();

        // if(getUrlParam('re')){
            // this.checkMember().then(_=> this.selectFirstPromotion());
        // }
        this.checkMember().then(this.refreshOrder)
            .catch(this.refreshOrder);
        // .catch(function(){
        //     // Tida.toast("订单异常，请退出后重试!");
        //     this.refreshOrder();
        //     Tida.hideLoading();
        // });
        this.checkOrderStatus().then(r => this.isPaid = r).catch(function(error){
            Tida.toast(error);
        });
    },
    methods: {
        refreshOrder() {
            // getUrl(`order/statement/${this.orderId}`, {
            //     taobaoUserCode: urlencode(this.nick)
            // })
            getUrl("order/statement/" + this.orderId + "?taobaoUserCode=" + urlencode(this.nick))
                .then(({data: r}) => {
                    Tida.hideLoading();
                    this.items = r.data.productList;
                    this.promotions = r.data.promotionList.map(p=>{
                        p.selected = false;
                        return p;
                    });

                    this.selectFirstPromotion();
                });
        },
        checkMember() {
            return new Promise((rs, rj) => {
                let check = ()=>{
                    getUrl('order/check-member', {
                        mixNick: this.nick
                    }).then(({data:r}) => {
                        if (r.data) {
                            //是会员
                            this.isMember = true;
                            rs(true);
                        }
                        else {
                            rj(false);
                            //非会员
                        }
                    }).catch(reason => {
                        Tida.toast(`检查会员信息失败 ${reason}`)
                    })
                };

                if(!this.nick){
                    Tida.doAuth(false, data => {
                        if (data.finish) {
                            //授权成功
                            this.isAuth = true;
                            Tida.mixNick({
                                sellerNick: "膜法世家官方旗舰店"
                            }, data => {
                                let nick = data.data.mixnick;
                                if (nick) {
                                    //拿到nick
                                    this.nick = nick;
                                    check();
                                }
                                else {
                                    rj(false);
                                    //没拿到nick todo:
                                }
                            })
                        }
                        else {
                            rj(false);
                            //授权失败 todo:
                        }
                    })
                }else{
                    check()
                }
            });
        },
        memberPay() {
            Tida.showLoading('正在跳转支付');
            this.checkMember()
                .then(r => {
                    //是会员
                    this.nonMemberPay(true);
                }).catch(r => {
                    //不是会员 跳转
                    Tida.hideLoading();
                if(this.nick){
                    this.jumpToMemberFollow();
                }else{
                    Tida.doAuth(false, data => {
                        if (data.finish) {
                            //授权成功
                            this.isAuth = true;
                            Tida.mixNick({
                                sellerNick: "膜法世家官方旗舰店"
                            }, data => {
                                let nick = data.data.mixnick;
                                if (nick) {
                                    //拿到nick
                                    this.nick = nick;
                                    this.jumpToMemberFollow();
                                }
                                else {
                                    Tida.toast('获取授权失败，请使用最新版本手淘客户端')
                                }
                            })
                        }
                        else {
                            // Tida.toast('')
                            //授权失败 todo:
                        }
                    })
                }
            });
        },
        nonMemberPay(isMemberPay) {
            isMemberPay = isMemberPay || false;
            let that = this;
            this.checkOrderStatus().then(function(result){
                that.isPaid = result
                if(that.isPaid){
                    Tida.toast('该订单已经支付，请勿重复支付')
                }else{
                    that.rawPay(isMemberPay);
                }
            })
        },
        rawPay(isMemberPay){
            isMemberPay = isMemberPay || false;
            let s = this.promotions.filter(p=>p.selected);
            postUrl('order/promotion-check',{
                "orderId": this.orderId,
                "promotionCode": s && s.length>0 && s[0].promotionCode,
                "taobaoUserCode": isMemberPay ? this.nick : ''
            }).then(({data:r})=>{
                Tida.hideLoading();
                if(r.code == '200'){
                    Tida.toast("跳转网址" + r.data.qrcode);
                    Tida.pushWindow(r.data.qrcode);
                    // window.location.href = r.data.shortUrl;
                }
                else{
                    Tida.toast(`跳转支付失败 ${r.msg}`);
                }
                // window.location.href = r.data.qrcode;
            }).catch(reason => {
                Tida.hideLoading();
                Tida.toast(`支付失败 ${reason}`)
            })
        },
        selectFirstPromotion(){
            if(this.isMember && this.promotions.length > 0){
                this.selectPromotion(this.promotions[0]);
            }
        },
        selectPromotion(p){
            if(this.isMember){
                this.promotions.forEach(p=>{
                    p.selected = false;
                });
                p.selected = true;
            }else{
                if(this.nick != null && this.nick != ''){
                    this.jumpToMemberFollow();
                }else{
                    Tida.doAuth(false, data => {
                        if (data.finish) {
                            //授权成功
                            this.isAuth = true;
                            Tida.mixNick({
                                sellerNick: "膜法世家官方旗舰店"
                            }, data => {
                                let nick = data.data.mixnick;
                                if (nick) {
                                    //拿到nick
                                    this.nick = nick;
                                    this.jumpToMemberFollow();
                                }
                                else {
                                    Tida.toast('获取授权失败，请使用最新版本手淘客户端')
                                }
                            })
                        }
                        else {
                            // Tida.toast('')
                            //授权失败 todo:
                        }
                    })
                }
            }
        },
        jumpToMemberFollow(){
            getUrl('order/member-follow', {
                orderId: this.orderId,
                callbackUrl: ewsUrl + '?' + toUrlParams({
                    order_id : this.orderId,
                    nick : this.nick,
                }),
                longTerm: false,
            }).then(({data : r})=> {
                if(r.code == '200'){
                    Tida.toast("跳转网址" + r.data.shortUrl);
                    Tida.pushWindow(r.data.shortUrl);
                    // window.location.href = r.data.shortUrl;
                }
                else{
                    Tida.toast(`跳转关注会员失败 ${r.msg}`);
                }

            }).catch(reason => {
                Tida.toast(`跳转关注会员失败 ${reason}`)
            })
        },
        checkOrderStatus(){
            let that = this;
            return new Promise(function(rs, rj){
                getUrl('/order/status/'+ that.orderId)
                .then(function(res){
                    if(res.data.data  == 0 || res.data.data  == 11 || res.data.data == 1){
                        rs(false);  // 未支付
                    }else{
                        rs(true);    //已支付
                    }
                }).catch(function(error){
                    rj('获取订单状态失败');
                })
            })
            
        }
    }
});