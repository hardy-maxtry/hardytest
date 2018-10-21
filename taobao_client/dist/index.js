"use strict";

var ewsUrl = "https://mfsjst.ewssh.m.jaeapp.com/ews_shoutao/index.html";
// const ewsUrl = "http://localhost:9001/";
var rootUrl = "api_test/";

function getUrlParam(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function toUrlParams(params) {
    return Object.keys(params).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
}

function getUrl(url, params) {
    return axios.get(rootUrl + url, {
        params: params
    });
}

function postUrl(url, params) {
    return axios.post(rootUrl + url, params);
}

function urlencode(str) {
    str = (str + '').toString();

    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}

var vm = new Vue({
    el: '#mfsj-ews',
    data: {
        items: [],
        promotions: [],
        // orderId: '7a2c4402-b187-4725-b7c1-952e21bad080',
        orderId: '',
        // deviceNo: 'AD4278BFBB',
        isAuth: false,
        nick: '',
        isPaid: false,
        isMember: false
    },
    created: function created() {
        var _this = this;

        Tida.showLoading("膜法世家欢迎您!");
        this.orderId = getUrlParam("order_id");
        this.nick = getUrlParam("nick");
        // this.refreshOrder();

        // if(getUrlParam('re')){
        // this.checkMember().then(_=> this.selectFirstPromotion());
        // }
        this.checkMember().then(this.refreshOrder).catch(this.refreshOrder);
        // .catch(function(){
        //     // Tida.toast("订单异常，请退出后重试!");
        //     this.refreshOrder();
        //     Tida.hideLoading();
        // });
        this.checkOrderStatus().then(function (r) {
            return _this.isPaid = r;
        }).catch(function (error) {
            Tida.toast(error);
        });
    },

    methods: {
        refreshOrder: function refreshOrder() {
            var _this2 = this;

            // getUrl(`order/statement/${this.orderId}`, {
            //     taobaoUserCode: urlencode(this.nick)
            // })
            getUrl("order/statement/" + this.orderId + "?taobaoUserCode=" + urlencode(this.nick)).then(function (_ref) {
                var r = _ref.data;

                Tida.hideLoading();
                _this2.items = r.data.productList;
                _this2.promotions = r.data.promotionList.map(function (p) {
                    p.selected = false;
                    return p;
                });

                _this2.selectFirstPromotion();
            });
        },
        checkMember: function checkMember() {
            var _this3 = this;

            return new Promise(function (rs, rj) {
                var check = function check() {
                    getUrl('order/check-member', {
                        mixNick: _this3.nick
                    }).then(function (_ref2) {
                        var r = _ref2.data;

                        if (r.data) {
                            //是会员
                            _this3.isMember = true;
                            rs(true);
                        } else {
                            rj(false);
                            //非会员
                        }
                    }).catch(function (reason) {
                        Tida.toast("\u68C0\u67E5\u4F1A\u5458\u4FE1\u606F\u5931\u8D25 " + reason);
                    });
                };

                if (!_this3.nick) {
                    Tida.doAuth(false, function (data) {
                        if (data.finish) {
                            //授权成功
                            _this3.isAuth = true;
                            Tida.mixNick({
                                sellerNick: "膜法世家官方旗舰店"
                            }, function (data) {
                                var nick = data.data.mixnick;
                                if (nick) {
                                    //拿到nick
                                    _this3.nick = nick;
                                    check();
                                } else {
                                    rj(false);
                                    //没拿到nick todo:
                                }
                            });
                        } else {
                            rj(false);
                            //授权失败 todo:
                        }
                    });
                } else {
                    check();
                }
            });
        },
        memberPay: function memberPay() {
            var _this4 = this;

            Tida.showLoading('正在跳转支付');
            this.checkMember().then(function (r) {
                //是会员
                _this4.nonMemberPay(true);
            }).catch(function (r) {
                //不是会员 跳转
                Tida.hideLoading();
                if (_this4.nick) {
                    _this4.jumpToMemberFollow();
                } else {
                    Tida.doAuth(false, function (data) {
                        if (data.finish) {
                            //授权成功
                            _this4.isAuth = true;
                            Tida.mixNick({
                                sellerNick: "膜法世家官方旗舰店"
                            }, function (data) {
                                var nick = data.data.mixnick;
                                if (nick) {
                                    //拿到nick
                                    _this4.nick = nick;
                                    _this4.jumpToMemberFollow();
                                } else {
                                    Tida.toast('获取授权失败，请使用最新版本手淘客户端');
                                }
                            });
                        } else {
                            // Tida.toast('')
                            //授权失败 todo:
                        }
                    });
                }
            });
        },
        nonMemberPay: function nonMemberPay(isMemberPay) {
            isMemberPay = isMemberPay || false;
            var that = this;
            this.checkOrderStatus().then(function (result) {
                that.isPaid = result;
                if (that.isPaid) {
                    Tida.toast('该订单已经支付，请勿重复支付');
                } else {
                    that.rawPay(isMemberPay);
                }
            });
        },
        rawPay: function rawPay(isMemberPay) {
            isMemberPay = isMemberPay || false;
            var s = this.promotions.filter(function (p) {
                return p.selected;
            });
            postUrl('order/promotion-check', {
                "orderId": this.orderId,
                "promotionCode": s && s.length > 0 && s[0].promotionCode,
                "taobaoUserCode": isMemberPay ? this.nick : ''
            }).then(function (_ref3) {
                var r = _ref3.data;

                Tida.hideLoading();
                if (r.code == '200') {
                    Tida.toast("跳转网址" + r.data.qrcode);
                    Tida.pushWindow(r.data.qrcode);
                    // window.location.href = r.data.shortUrl;
                } else {
                    Tida.toast("\u8DF3\u8F6C\u652F\u4ED8\u5931\u8D25 " + r.msg);
                }
                // window.location.href = r.data.qrcode;
            }).catch(function (reason) {
                Tida.hideLoading();
                Tida.toast("\u652F\u4ED8\u5931\u8D25 " + reason);
            });
        },
        selectFirstPromotion: function selectFirstPromotion() {
            if (this.isMember && this.promotions.length > 0) {
                this.selectPromotion(this.promotions[0]);
            }
        },
        selectPromotion: function selectPromotion(p) {
            var _this5 = this;

            if (this.isMember) {
                this.promotions.forEach(function (p) {
                    p.selected = false;
                });
                p.selected = true;
            } else {
                if (this.nick != null && this.nick != '') {
                    this.jumpToMemberFollow();
                } else {
                    Tida.doAuth(false, function (data) {
                        if (data.finish) {
                            //授权成功
                            _this5.isAuth = true;
                            Tida.mixNick({
                                sellerNick: "膜法世家官方旗舰店"
                            }, function (data) {
                                var nick = data.data.mixnick;
                                if (nick) {
                                    //拿到nick
                                    _this5.nick = nick;
                                    _this5.jumpToMemberFollow();
                                } else {
                                    Tida.toast('获取授权失败，请使用最新版本手淘客户端');
                                }
                            });
                        } else {
                            // Tida.toast('')
                            //授权失败 todo:
                        }
                    });
                }
            }
        },
        jumpToMemberFollow: function jumpToMemberFollow() {
            getUrl('order/member-follow', {
                orderId: this.orderId,
                callbackUrl: ewsUrl + '?' + toUrlParams({
                    order_id: this.orderId,
                    nick: this.nick
                }),
                longTerm: false
            }).then(function (_ref4) {
                var r = _ref4.data;

                if (r.code == '200') {
                    Tida.toast("跳转网址" + r.data.shortUrl);
                    Tida.pushWindow(r.data.shortUrl);
                    // window.location.href = r.data.shortUrl;
                } else {
                    Tida.toast("\u8DF3\u8F6C\u5173\u6CE8\u4F1A\u5458\u5931\u8D25 " + r.msg);
                }
            }).catch(function (reason) {
                Tida.toast("\u8DF3\u8F6C\u5173\u6CE8\u4F1A\u5458\u5931\u8D25 " + reason);
            });
        },
        checkOrderStatus: function checkOrderStatus() {
            var that = this;
            return new Promise(function (rs, rj) {
                getUrl('/order/status/' + that.orderId).then(function (res) {
                    if (res.data.data == 0 || res.data.data == 11 || res.data.data == 1) {
                        rs(false); // 未支付
                    } else {
                        rs(true); //已支付
                    }
                }).catch(function (error) {
                    rj('获取订单状态失败');
                });
            });
        }
    }
});