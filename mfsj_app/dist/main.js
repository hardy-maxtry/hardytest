'use strict';

var resourceRoot = '/';
var apiRoot = 'api/';
var apiBackRoot = 'apiBack/';

var adShowWait = 60000; //无操作显示广告等待时间
var adStayDuration = 5000; //每张广告持续时间
var checkMachineDuration = 5000; //机器状态轮询时间
var queryAdsDuration = 60000;
var queryItemDuration = 60000;

var qrWaitDuration = 60000; //二维码超时时间
var qrWaitAfterScanuration = 300000; //二维码扫描后超时时间
var qrCheckInterval = 5000; //扫码状态轮询时间
var deliveryCheckInterval = 5000; //出货状态轮询时间
var deliveryStayDuration = 60000;

function __get(url, param, headers) {
    return new Promise(function (rs, rj) {
        $.ajax({
            method: 'get',
            url: url,
            data: param,
            dataType: "json",
            headers: headers
        }).done(function (resp) {
            rs(resp);
        }).fail(function (resp) {
            rj(resp);
        });
    });
}

function __postJson(url, param) {
    return new Promise(function (rs, rj) {
        $.ajax({
            method: 'post',
            url: url,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(param),
            dataType: "json"
        }).done(function (resp) {
            rs(resp);
        }).fail(function (resp) {
            rj(resp);
        });
    });
}

function getUrl(url, param, headers) {
    return __get(apiRoot + url, param, headers);
}

function postUrl(url, param) {
    return __postJson(apiRoot + url, param);
}

function getBackUrl(url, param, headers) {
    return __get(apiBackRoot + url, param, headers);
}

function postBackUrl(url, param) {
    return __postJson(apiBackRoot + url, param);
}

function getInfo(name) {
    return localStorage[name];
}

function setInfo(name, value) {
    localStorage[name] = value;
}

function HandleBag() {
    this._timeoutBag = [];
    this._intervalBag = [];
    this.clear = function () {
        this._timeoutBag.forEach(function (_) {
            return clearTimeout(_);
        });
        this._intervalBag.forEach(function (_) {
            return clearInterval(_);
        });
        this._timeoutBag.length = 0;
        this._intervalBag.length = 0;
    };

    this.setTimeout = function (handle, timeout) {
        this._timeoutBag.push(setTimeout(handle, timeout));
    };
    this.setInterval = function (handle, timeout, first) {
        if (first) handle();
        this._intervalBag.push(setInterval(handle, timeout));
    };
}

HandleBag.clear = function (bag) {
    if (bag) bag.clear();
};

function PromiseDebounce() {}

PromiseDebounce.create = function (handle) {
    var exists = null;
    return function () {
        if (exists) {
            //直接跳过不执行
            return Promise.reject('debounce cancel');
        } else {
            exists = handle();
            return exists.then(function (_) {
                exists = null;
                return _;
            });
        }
    };
};

var vm = new Vue({
    el: '#mfsj-container',
    data: {
        view: 'ads',
        deviceTaobaoNo: '',
        deviceShopId: '',
        deviceInfo: {},

        totalCount: 0,
        totalPrice: 0,
        totalSalePrice: 0,

        qrVisible: false,
        qrImage: false,
        qrTimer: 0,

        promotionDetailVisible: false,
        detailItem: null,
        onsaleItems: [],

        ads: [],
        showAd: null,
        showAdIndex: 0,
        machineError: false,

        showCartContent: false,

        machineInfoDialog: false,
        loginToken: null,
        loginInfo: {
            username: '',
            password: ''
        },
        loginInfoRules: {
            username: [{
                required: true, message: '请输入用户名'
            }],
            password: [{
                required: true, message: '请输入密码'
            }]
        },
        machineInfo: {
            deviceNo: '',
            shopId: ''
        },
        machineInfoRules: {
            deviceNo: [{
                required: true, message: '请输入机器编号'
            }],
            shopId: [{
                required: true, message: '请输入门店编号'
            }]
        },

        machineInfoClicks: 0,
        machineInfoClicksDebounce: null,

        paySuccessVisible: false,
        payOrderPrice: 0,
        payOrderId: null,
        deliveryTimer: 0,
        deliveryInfo: {
            deliveryOrderId: 1233329295491234,
            deliveryItems: []
        },

        deliveryOrderStatus: 0,
        orderStatusDic: {
            "-3": '取消',
            "-2": '异常',
            "-1": '缺货',
            "0": '已创建',
            "1": '待支付',
            "11": '已扫描',
            "2": '已支付',
            "10": '准备中',
            "20": '取货中',
            "40": '已取货'
        },
        deliveryStatusDic: {
            "-3": '取消',
            "-2": '异常',
            "-1": '缺货',
            "0": "已创建",
            "3": '已出货',
            "5": '出货中'
        }
    },
    computed: {
        cartItems: function cartItems() {
            return (this.onsaleItems || []).filter(function (i) {
                return i.buyCount > 0;
            });
        },
        adsShowing: function adsShowing() {
            var _this = this;

            return this.ads.filter(function (a) {
                return a.positionType == (_this.machineError ? 2 : 1);
            });
        },
        adsDelivery: function adsDelivery() {
            return this.ads.filter(function (a) {
                return a.positionType == 3;
            });
        }
    },

    created: function created() {
        var _this2 = this;

        this.deviceTaobaoNo = getInfo('deviceNo');
        // this.deviceTaobaoNo = "100001";


        setInterval(function (_) {
            return _this2.randomSelectAds();
        }, adStayDuration);
        setInterval(function (_) {
            _this2.queryDeviceInfo();
        }, checkMachineDuration);
        this.queryDeviceInfo();

        setInterval(function (_) {
            _this2.queryAds();
        }, queryAdsDuration);

        this.adsShowDebounce = _.debounce(function (_) {
            _this2.clearCart();
            _this2.view = 'ads';
        }, adShowWait);

        this.machineInfoClicksDebounce = _.debounce(function (_) {
            _this2.machineInfoClicks = 0;
        }, 1000);

        this.initMachine();
    },

    watch: {
        machineError: function machineError(value) {
            if (value) {
                this.view = 'ads';
            }
            this.randomSelectAds();
        },
        qrVisible: function qrVisible(value) {
            if (!value) {
                //清除二维码的所有计时器
                HandleBag.clear(this.qrBag);
            }
        },
        view: function view(value) {
            if (value != 'ads') {
                this.adsShowDebounce();
            }
            if (value != 'delivery') {
                HandleBag.clear(this.deliveryBag);
            }
            if (value == 'detail') {
                window.scrollTo(0, 0);
            }
        }
    },

    methods: {
        clickMachineInfo: function clickMachineInfo() {
            this.machineInfoClicks++;
            this.machineInfoClicksDebounce();
            if (this.machineInfoClicks > 8) {
                this.showMachineInfo();
            }
        },
        showMachineInfo: function showMachineInfo() {
            this.machineInfo.deviceNo = this.deviceTaobaoNo;
            this.machineInfo.shopId = '';
            this.machineInfoDialog = true;
        },
        confirmLoginInfo: function confirmLoginInfo() {
            var _this3 = this;

            this.$refs['loginInfoForm'].validate(function (valid) {
                if (valid) {

                    postBackUrl('logon/sign-in', {
                        "password": _this3.loginInfo.password,
                        "userName": _this3.loginInfo.username
                    }).then(function (_) {
                        if (_.code == '200') {
                            _this3.loginToken = _.data.token;
                        } else {
                            _this3.$message({
                                message: _.msg,
                                type: 'error'
                            });
                        }
                        ;
                    }).catch(function (_) {
                        _this3.$message({
                            message: _,
                            type: 'error'
                        });
                    });
                } else {
                    return false;
                }
            });
        },
        confirmMachineInfo: function confirmMachineInfo() {
            var _this4 = this;

            this.$refs['machineInfoForm'].validate(function (valid) {
                if (valid) {

                    getBackUrl('device/device-init', {
                        deviceTaobaoNo: _this4.machineInfo.deviceNo,
                        shopId: _this4.machineInfo.shopId
                    }, {
                        token: _this4.loginToken
                    }).then(function (resp) {
                        if (resp.data) {
                            _this4.$message('注册成功');
                            _this4.deviceTaobaoNo = _this4.machineInfo.deviceNo;
                            setInfo('deviceNo', _this4.deviceTaobaoNo);
                            _this4.initMachine();
                            _this4.machineInfoDialog = false;
                        } else {
                            _this4.$message({
                                message: '注册失败，门店编号不匹配，请重新检查输入',
                                type: 'error'
                            });
                        }
                    });
                } else {
                    return false;
                }
            });
        },
        initMachine: function initMachine() {
            this.clearCart();
            if (this.deviceTaobaoNo) {
                this.queryItems();
                this.queryAds();
            }
        },
        queryAds: function queryAds() {
            var _this5 = this;

            getUrl('advert/list', { deviceTaobaoNo: this.deviceTaobaoNo }).then(function (resp) {
                _this5.ads = resp.data.map(function (ad) {
                    ad.image = resourceRoot + ad.image;
                    return ad;
                });
                // if (this.adsShowing.length > 0) {
                //     this.view = 'ads';
                // }

                _this5.randomSelectAds();
            }).catch(function (resp, status, err) {
                _this5.$message(resp.statusText);
            });
        },
        queryDeviceInfo: function queryDeviceInfo() {
            var _this6 = this;

            if (this.deviceTaobaoNo) {
                getUrl('device/detail', { deviceTaobaoNo: this.deviceTaobaoNo }).then(function (resp) {
                    if (resp.data.status > 0) {
                        _this6.deviceInfo = resp.data;
                        _this6.machineError = false;
                    } else {
                        _this6.machineError = true;
                    }
                }).catch(function (resp) {
                    _this6.machineError = true;
                });
            }
        },
        randomSelectAds: function randomSelectAds() {
            var choose = this.adsShowing || [];

            if (choose.length > 0) {
                this.showAd = choose[this.showAdIndex];
                this.showAdIndex = (this.showAdIndex + 1) % choose.length;
            } else {
                this.showAd = null;
            }
        },
        clickAd: function clickAd(ad) {
            if (!this.deviceTaobaoNo) {
                this.clickMachineInfo();
                return;
            }

            if (this.machineError) return;

            var item = _.find(this.onsaleItems, function (item) {
                return item.taobaoNo == ad.url;
            }); //taobaoNumber
            if (item) {
                this.selectItem(item);
            } else {
                this.view = 'list';
            }
        },
        everyClick: function everyClick() {
            this.adsShowDebounce();
        },
        queryItems: function queryItems() {
            var _this7 = this;

            getUrl('product/list', { deviceTaobaoNo: this.deviceTaobaoNo }).then(function (resp) {
                return _this7.onsaleItems = resp.data.map(function (d) {
                    // let images = ['download.jpg'];
                    var images = (d.images || []).map(function (i) {
                        return resourceRoot + i;
                    });
                    return {
                        taobaoNo: d.productTaobaoNo,
                        title: d.name,
                        hot: d.hot,
                        images: images.length > 0 ? images : ['download.jpg'],
                        price: d.price,
                        salePrice: d.salePrice,
                        stock: d.stock,
                        buyCount: 0,
                        unit: d.unit,
                        description: '',
                        specifications: d.specifications,
                        promotions: d.promotion
                    };
                });
            });
        },
        addItem: function addItem(item) {
            if (item.buyCount < item.stock) {
                item.buyCount = item.buyCount + 1;
                this.refreshCart();
            }
        },
        removeItem: function removeItem(item) {
            item.buyCount = Math.max(0, item.buyCount - 1);
            this.refreshCart();
        },
        selectItem: function selectItem(item) {
            var _this8 = this;

            if (item.detailInfo) {
                this.detailItem = item;
                this.view = 'detail';
            } else {
                getUrl('/product/detail/' + this.deviceTaobaoNo + '/' + item.taobaoNo).then(function (data) {
                    var detailItem = data.data;
                    item.rate = detailItem.score;
                    // item.content = detailItem.content;
                    item.description = detailItem.content;
                    item.detailInfo = detailItem;
                    _this8.detailItem = item;
                    _this8.view = 'detail';
                });
            }
        },
        unselectItem: function unselectItem() {
            this.detailItem = null;
            this.view = 'list';
        },
        showQR: function showQR() {
            var _this9 = this;

            this.qrImage = false;
            this.payOrderId = null;
            HandleBag.clear(this.qrBag);

            this.qrBag = new HandleBag();

            //保持不显示广告
            this.qrBag.setInterval(function (_) {
                return _this9.adsShowDebounce();
            }, 10000);

            this.qrTimer = Math.round(qrWaitDuration / 1000);
            this.qrBag.setInterval(function (_) {
                //QR倒计时
                _this9.qrTimer = _this9.qrTimer - 1;
                if (_this9.qrTimer < 1) {
                    _this9.qrVisible = false;
                }
            }, 1000);

            var scaned = false;
            var checkOrderStatus = PromiseDebounce.create(function (_) {
                return getUrl('order/status/' + _this9.payOrderId);
            });
            this.qrBag.setInterval(function (r) {
                checkOrderStatus().then(function (r) {
                    if (r.data == 11 && !scaned) {
                        _this9.qrTimer = Math.round(qrWaitAfterScanuration / 1000);
                        scaned = true;
                    }
                    if (_.includes([2, 10, 20, 40], r.data)) {
                        //已支付
                        _this9.qrVisible = false;
                        _this9.toDeliveryView();
                    }
                }).catch(function (_) {
                    console.error('check qr status', _);
                });
            }, qrCheckInterval);

            postUrl('order/create', {
                deviceTaobaoNo: this.deviceInfo.deviceTaobaoNo,
                item: this.cartItems.map(function (x) {
                    return {
                        productTaobaoNo: x.taobaoNo,
                        quantity: x.buyCount,
                        salePrice: x.salePrice,
                        saleTotalPrice: x.buyCount * x.salePrice,
                        sku: '0'
                    };
                })
            }).then(function (resp) {
                if (!_this9.qrCreator) {
                    _this9.qrCreator = new QRCode(document.getElementById("payQR"), {
                        text: resp.data.qrcode,
                        width: 400,
                        height: 400,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.H
                    });
                } else {
                    _this9.qrCreator.clear();
                    _this9.qrCreator.makeCode(resp.data.qrcode);
                }

                _this9.payOrderId = resp.data.orderId;
                _this9.qrImage = true;
            });

            this.qrVisible = true;
        },
        toDeliveryView: function toDeliveryView() {
            var _this10 = this;

            this.payOrderPrice = this.totalSalePrice;
            this.clearCart();
            this.paySuccessVisible = true;

            this.deliveryBag = new HandleBag();
            this.deliveryBag.setTimeout(function (_) {
                return _this10.paySuccessVisible = false;
            }, 5000);

            //检查出货状态
            var checkDeliveryStatus = PromiseDebounce.create(function (_) {
                return getUrl('order/pickup-status/' + _this10.payOrderId);
            });
            this.deliveryBag.setInterval(function (_) {
                checkDeliveryStatus().then(function (_) {
                    _this10.deliveryInfo = _.data;
                });
            }, deliveryCheckInterval, true);

            //检查订单状态
            var checkOrderStatus = PromiseDebounce.create(function (_) {
                return getUrl('order/status/' + _this10.payOrderId);
            });
            this.deliveryBag.setInterval(function (r) {
                checkOrderStatus().then(function (r) {
                    _this10.deliveryOrderStatus = r.data;
                }).catch(function (_) {
                    console.error('check qr status', _);
                });
            }, deliveryCheckInterval, true);

            this.deliveryTimer = deliveryStayDuration / 1000;
            this.deliveryBag.setInterval(function (_) {
                _this10.deliveryTimer = _this10.deliveryTimer - 1;
                if (_this10.deliveryTimer < 1) {
                    _this10.view = 'list';
                }
            }, 1000);

            this.view = 'delivery';
        },
        refreshCart: function refreshCart() {
            var r = this.cartItems.reduce(function (o, b) {
                o.price = o.price + b.price * b.buyCount;
                o.salePrice = o.salePrice + b.salePrice * b.buyCount;
                o.count = o.count + b.buyCount;
                return o;
            }, {
                price: 0,
                salePrice: 0,
                count: 0
            });

            this.totalPrice = r.price.toFixed(2);
            this.totalSalePrice = r.salePrice.toFixed(2);
            this.totalCount = r.count;

            if (this.totalCount == 0) {
                this.showCartContent = false;
            }
        },
        confirmClearCart: function confirmClearCart() {
            var _this11 = this;

            this.$confirm('清空购物车？').then(function (_) {
                _this11.clearCart();
            });
        },
        clearCart: function clearCart() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.onsaleItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var item = _step.value;

                    item.buyCount = 0;
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.refreshCart();
        },
        longCut: function longCut(text, length) {
            if (text.length > length) {
                return text.substr(0, length) + '...';
            } else {
                return text;
            }
        },
        getDic: function getDic(status, dic, def) {
            var r = dic[status];
            return r || def;
        },
        seePromotionDetails: function seePromotionDetails() {}
    }
});
//# sourceMappingURL=main.js.map