const resourceRoot = 'http://47.99.36.92:10001/apiback/';
// const resourceRoot = 'http://139.224.54.234:8082/';
const apiRoot = 'api/';
const apiBackRoot = 'apiBack/';

const version = "1.1.2";


const adShowWait = 60000; //无操作显示广告等待时间
// //todo:debug
// const adShowWait = 6000000; //无操作显示广告等待时间
const adStayDuration = 15000; //每张广告持续时间
const checkMachineDuration = 5000; //机器状态轮询时间
let checkMachineFail = 0;
const queryAdsDuration = 60000;
const queryItemDuration = 60000;

const qrWaitDuration = 60000; //二维码超时时间
const qrWaitAfterScanuration = 300000; //二维码扫描后超时时间
const qrCheckInterval = 5000; //扫码状态轮询时间
const deliveryCheckInterval = 5000; //出货状态轮询时间
const deliveryStayDuration = 30000;

!function (e) {
    var i = {}, t = {}, n = 0;
    e.rocNative = {
        __nativeCall: function (e, t, n) {
            var a = i[e];
            delete i[e], "function" == typeof a && a(t, n)
        }, __callNative: function (t, a, o) {
            "function" == typeof o && (n++, i[n] = o);
            var r = JSON.stringify({
                name: t,
                callbackId: "function" == typeof o ? n : -1,
                param: a === undefined ? {} : a
            });
            if (e.__rocAndroid) {
                e.__rocAndroid.postMessage(r)
                return true;
            }
            if (e.webkit && window.webkit.messageHandlers.rociOS) {
                window.webkit.messageHandlers.rociOS.postMessage(r)
                return true;
            }
            return false;
        }, __onEvent: function (e, i) {
            if (e && i && "function" == typeof i) {
                (t[e] || (t[e] = [])).push(i)
            }
        }, __clearEvent: function (e) {
            e && delete t[e]
        }, __fireEvent: function (e, i) {
            var n = t[e];
            n && n.forEach(function (e) {
                e(i)
            })
        }, on: function (e, i) {
            rocNative.__onEvent(e, i)
        }, off: function (e) {
            rocNative.__clearEvent(e)
        }
    }, function () {
        Array.prototype.slice.apply(arguments).forEach(function (i) {
            e.rocNative[i] = function (t) {
                return new Promise(function (n, a) {
                    e.rocNative.__callNative(i, t, function (e, i) {
                        null !== e ? a({error: e, result: i}) : n(i)
                    }) ? void 0 : n({})
                })
            }
        })
    }("appVersion", "appInit", "heartBeat", "getAppSetting", "setAppSetting")
}(window)

function __get(url, param, headers) {
    return new Promise(function (rs, rj) {
        $.ajax({
            method: 'get',
            url: url,
            data: param,
            dataType: "json",
            headers: headers,
        }).done(function (resp) {
            rs(resp);
        })
            .fail(function (resp) {
                rj(resp);
            })
    })
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
        })
            .fail(function (resp) {
                rj(resp);
            })
    })
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
    return rocNative.getAppSetting({
        name: name
    }).then(r => {
        return r.result || localStorage[name];
    });
}

function setInfo(name, value) {
    localStorage[name] = value;
    rocNative.setAppSetting({
        name: name,
        value: value
    });
}

function HandleBag() {
    this._timeoutBag = [];
    this._intervalBag = [];
    this.clear = function () {
        this._timeoutBag.forEach(_ => clearTimeout(_));
        this._intervalBag.forEach(_ => clearInterval(_));
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

function PromiseDebounce() {
}

PromiseDebounce.create = function (handle) {
    let exists = null;
    return function () {
        if (exists) {
            //直接跳过不执行
            return Promise.reject('debounce cancel');
        }
        else {
            exists = handle();
            return exists.then(_ => {
                exists = null;
                return _;
            });
        }
    }
};

function convertToResourceUrl(url){
    return resourceRoot + url;
}

let vm = new Vue({
        el: '#mfsj-container',
        data: {
            url: null,
            appVersion: null,

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

            showItemDetail  : false,
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
                password:
                    [{
                        required: true, message: '请输入密码'
                    }]
            },
            machineInfo:
                {
                    deviceNo: '',
                    shopId: '',
                },
            machineInfoRules: {
                deviceNo: [{
                    required: true, message: '请输入机器编号'
                }],
                shopId:
                    [{
                        required: true, message: '请输入门店编号'
                    }]
            }
            ,
            machineInfoClicks: 0,
            machineInfoClicksDebounce: null,

            paySuccessVisible: false,
            paySuccessTimer : 0,
            // payOrderPrice: 0,
            // payOrderId: null,
            // deliveryTimer: 0,
            // deliveryInfo:
            //     {
            //         username : '',
            //         deliveryOrderId: 10000000,
            //         deliveryItems:
            //             []
            //     }
            // ,
            showContactTaobao : false,
            deliveryOrderStatus: 0,
            // orderStatusDic: {
            //     "-30" : "取消",
            //     "-20" : "异常",
            //     "-10" : "缺货",
            //     "0": '已创建',
            //     "1": '待支付',
            //     "11": '已扫描',
            //     "2": '已支付',
            //     "10": '准备中',
            //     "20": '取货中',
            //     "40": '已取货'
            // },
            // deliveryStatusDic: {
            //     "-3": '取消',
            //     "-2": '异常',
            //     "-1": '缺货',
            //     "0": "已创建",
            //     "3": '已出货',
            //     "5": '出货中',
            // }
            showEventAd : false,
        },
        computed: {
            cartItems() {
                return (this.onsaleItems || []).filter(i => i.buyCount > 0);
            }
            ,
            adsShowing() {
                return this.ads.filter(a => a.positionType == (this.machineError ? 2 : 1))
            }
            ,
            adsDelivery() {
                return this.ads.filter(a => a.positionType == 3);
            },
            adsEvents(){
                return this.ads.filter(a => a.positionType == 4);
            }
        },
        created() {
            this.url = window.location.href;
            rocNative.appVersion().then(r => {
                this.version = `${r.appVersion}`
            }).catch(e => console.error(e));

            rocNative.appInit();
            setInterval(_ => {
                //给App发送心跳
                rocNative.heartBeat();
            }, 3000);

            setInterval(_ => this.randomSelectAds(), adStayDuration);
            setInterval(_ => {
                this.queryDeviceInfo();
            }, checkMachineDuration);
            this.queryDeviceInfo();

            setInterval(_ => {
                this.queryAds();
            }, queryAdsDuration);

            setInterval(_ => {
                if (this.view == 'ads') {
                    this.queryItems();
                }
            }, queryItemDuration);

            this.adsShowDebounce = _.debounce(_ => {
                this.showCartContent = false;
                this.showItemDetail = false;
                this.showEventAd = false;
                this.clearCart();
                this.view = 'ads';
            }, adShowWait);

            this.machineInfoClicksDebounce = _.debounce(_ => {
                this.machineInfoClicks = 0;
            }, 500);


            getInfo('deviceNo').then(r => {
                this.deviceTaobaoNo = r;
            });
        }
        ,
        watch: {
            machineError(value) {
                if (value) {
                    this.view = 'ads';
                }
                this.randomSelectAds();
            }
            ,
            showItemDetail(value){
                if(!value){
                    this.detailItem = null
                }
            },
            qrVisible(value) {
                if (!value) {
                    //清除二维码的所有计时器
                    HandleBag.clear(this.qrBag);
                }
            }
            ,
            paySuccessVisible(value){
                if(!value){
                    HandleBag.clear(this.paySuccessBag);
                    this.queryItems();
                }
            },
            showContactTaobao(value){
                if(!value){
                    HandleBag.clear(this.paySuccessBag);
                    this.queryItems();
                }
            },
            view(value) {
                if (value != 'ads') {
                    this.adsShowDebounce();
                }
            },
            machineInfoDialog(value) {
                //打开或关闭对话框
                this.loginToken = null;
                this.loginInfo.username = '';
                this.loginInfo.password = '';
            },
            deviceTaobaoNo(value) {
                setInfo("deviceNo", value);
                this.initMachine();
            }
        }
        ,
        methods: {
            convertToResourceUrl,
            clickMachineInfo() {
                this.machineInfoClicks++;
                this.machineInfoClicksDebounce();
                if (this.machineInfoClicks > 8) {
                    this.showMachineInfo();
                }
            }
            ,
            showMachineInfo() {
                this.machineInfo.deviceNo = this.deviceTaobaoNo;
                this.machineInfo.shopId = '';
                this.machineInfoDialog = true;
            }
            ,
            confirmLoginInfo() {
                this.$refs['loginInfoForm'].validate((valid) => {
                    if (valid) {

                        postBackUrl('logon/sign-in', {
                            "password": this.loginInfo.password,
                            "userName": this.loginInfo.username
                        }).then(_ => {
                            if (_.code == '200') {
                                this.loginToken = _.data.token;
                            }
                            else {
                                this.$message({
                                    message: _.msg,
                                    type: 'error'
                                })
                            }
                            ;
                        }).catch(_ => {
                            this.$message({
                                message: _,
                                type: 'error'
                            })
                        });
                    } else {
                        return false;
                    }
                });

            },
            confirmMachineInfo() {
                this.$refs['machineInfoForm'].validate((valid) => {
                    if (valid) {

                        getBackUrl('device/device-init',
                            {
                                deviceTaobaoNo: this.machineInfo.deviceNo,
                                shopId: this.machineInfo.shopId
                            }, {
                                token: this.loginToken
                            })
                            .then(resp => {
                                if (resp.data) {
                                    this.$message('注册成功');
                                    this.deviceTaobaoNo = this.machineInfo.deviceNo;
                                    setInfo('deviceNo', this.deviceTaobaoNo);
                                    this.initMachine();
                                    this.machineInfoDialog = false;
                                }
                                else {
                                    this.$message({
                                        message: '注册失败，门店编号不匹配，请重新检查输入',
                                        type: 'error'
                                    })
                                }
                            }).catch(e => {
                            this.$message({
                                message: '注册失败，服务器错误，请重试',
                                type: 'error'
                            })
                        });
                    } else {
                        return false;
                    }
                });
            }
            ,
            initMachine() {
                this.clearCart();
                if (this.deviceTaobaoNo) {
                    this.queryDeviceInfo();
                    this.queryItems();
                    this.queryAds();
                }
            }
            ,
            queryAds() {
                if (this.deviceTaobaoNo) {
                    getUrl('advert/list', {deviceTaobaoNo: this.deviceTaobaoNo})
                        .then((resp) => {
                            this.ads = resp.data.map((ad) => {
                                ad.image = convertToResourceUrl(ad.image);
                                return ad;
                            });
                            // if (this.adsShowing.length > 0) {
                            //     this.view = 'ads';
                            // }

                            this.randomSelectAds();
                        }).catch((resp, status, err) => {
                        this.$message(resp.statusText);
                    });
                }
            }
            ,
            queryDeviceInfo() {
                if (this.deviceTaobaoNo) {
                    getUrl('device/detail', {deviceTaobaoNo: this.deviceTaobaoNo})
                        .then(resp => {
                            if (resp.data.status > 0) {
                                this.deviceInfo = resp.data;
                                this.machineError = false;
                            }
                            else {
                                    this.machineError = true;
                            }

                            //判断版本，刷新页面
                            if(resp.data.version != version){
                                // todo: debug
                                // window.location.reload()
                            }
                        }).catch(resp => {
                            this.machineError = true;
                    })
                }
            },
            randomSelectAds() {
                let choose = this.adsShowing || [];

                if (choose.length > 0) {
                    this.showAd = choose[this.showAdIndex];
                    this.showAdIndex = (this.showAdIndex + 1) % choose.length;
                }
                else {
                    this.showAd = null;
                }
            }
            ,
            clickAd(ad) {
                if (!this.deviceTaobaoNo) {
                    this.clickMachineInfo();
                    return;
                }

                if (this.machineError) return;


                this.view = 'list';
                let item = ad && _.find(this.onsaleItems, (item) => item.taobaoNo == ad.url);   //taobaoNumber
                if (item) {
                    this.selectItem(item);
                }
                else{
                    this.showEventAd = true;
                }
            }
            ,
            everyClick() {
                this.adsShowDebounce();
            }
            ,
            queryItems() {
                if (this.deviceTaobaoNo) {
                    getUrl('product/list', {deviceTaobaoNo: this.deviceTaobaoNo})
                        .then((resp) => this.onsaleItems = resp.data.map((d) => {

                            let images = (d.images || []).map((i) => convertToResourceUrl(i));
                            // let detailImages = ((d.detailImages || '').split(',') || []).map((i) => convertToResourceUrl(i));
                            let detailImages = (d.detailImages || []).map((i) => convertToResourceUrl(i));
                            return {
                                ...d,
                                taobaoNo: d.productTaobaoNo,
                                title: d.name,
                                detailImages : detailImages.length > 0 ? detailImages : images,
                                images: images.length > 0 ? images : ['download.jpg'],
                                buyCount: 0,
                                description: '',
                                promotions: d.promotion,
                                tags : (d.tag || '').split(',').filter(t=>t).map(t=>convertToResourceUrl(t)),
                            };
                        }));
                }
            }
            ,
            addItem(item,evt) {
                if (item.buyCount < item.stock) {
                    item.buyCount = item.buyCount + 1;
                    this.refreshCart();

                    this.flyTo($(`<div class="fly-icon"><img src="${item.cover || 'taobao-logo.png'}"></div>`),evt.target,this.$refs.cartIcon)
                        .then(_=>{
                            this.doAnimate(this.$refs.cartIcon,'pulse');
                        });
                }
            }
            ,
            flyTo(flyItem,source,target){
                return new Promise((rs,rj)=>{
                    let xy = $(source).offset();
                    $(flyItem).offset(xy);
                    $("body").append(flyItem);
                    this.$nextTick(_=>{
                        let txy = $(target).offset();
                        flyItem.offset(txy).one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd',
                            _=>{
                                flyItem.remove();
                                rs();
                            });
                    })
                })
            },
            doAnimate(el,name){
                $(el).removeClass(`animated ${name}`);
                this.$nextTick(_=>{
                    $(el).addClass(`animated ${name}`)
                        .one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(event) {
                            $(el).removeClass(`animated ${name}`);
                        })
                })
            }
            ,
            removeItem(item) {
                item.buyCount = Math.max(0, item.buyCount - 1);
                this.refreshCart();
            }
            ,
            selectItem(item) {
                if (item.detailInfo) {
                    this.detailItem = item;
                    this.showItemDetail = true;
                }
                else {
                    getUrl(`/product/detail/${this.deviceTaobaoNo}/${item.taobaoNo}`)
                        .then((data) => {
                            let detailItem = data.data;
                            item.rate = detailItem.score;
                            // item.content = detailItem.content;
                            item.description = detailItem.content;
                            item.detailInfo = detailItem;
                            this.detailItem = item;
                            this.showItemDetail = true;
                        })
                }
            }
            ,
            backToList() {
                this.detailItem = null;
                this.showItemDetail = false;
                this.qrVisible = false;
                this.paySuccessVisible = false;
                this.showContactTaobao = false;
                this.view = 'list';
            }
            ,
            showQR() {
                if(this.cartItems.length == 0){
                    return;
                }
                this.showItemDetail = false;
                this.qrImage = false;
                this.payOrderId = null;
                HandleBag.clear(this.qrBag);

                this.qrBag = new HandleBag();

                //保持不显示广告
                this.qrBag.setInterval(_ => this.adsShowDebounce(), 10000);


                this.qrTimer = Math.round(qrWaitDuration / 1000);
                this.qrBag.setInterval(_ => {
                    //QR倒计时
                    this.qrTimer = this.qrTimer - 1;
                    if (this.qrTimer < 1) {
                        this.qrVisible = false;
                    }
                }, 1000);

                let scaned = false;

                postUrl('order/create', {
                    deviceTaobaoNo: this.deviceInfo.deviceTaobaoNo,
                    item: this.cartItems.map(x => {
                        return {
                            productTaobaoNo: x.taobaoNo,
                            quantity: x.buyCount,
                            salePrice: x.salePrice,
                            saleTotalPrice: x.buyCount * x.salePrice,
                            sku: '0'
                        }
                    }),
                    action : 'ews',
                    scanUrl: "mfsjst.ewssh.m.jaeapp.com/ews_shoutao/index.html",
                    // scanUrl: "mfsjst.ewssh.m.jaeapp.com/ews_shoutao_test/index.html",
                }).then(resp => {
                    if (!this.qrCreator) {
                        this.qrCreator = new QRCode(document.getElementById("payQR"), {
                            text: resp.data.qrcode,
                            width: 400,
                            height: 400,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                    }
                    else {
                        this.qrCreator.clear();
                        this.qrCreator.makeCode(resp.data.qrcode);
                    }


                    let checkOrderStatus = PromiseDebounce.create(_ => {
                        return getUrl(`order/status/${this.payOrderId}`);
                    });
                    this.qrBag.setInterval(r => {
                        checkOrderStatus().then(r => {
                            if (r.data == 11 && !scaned) {
                                this.qrTimer = Math.round(qrWaitAfterScanuration / 1000);
                                scaned = true;
                            }
                            if (_.includes([-30,-20,-10,2, 10, 20, 40], r.data)) {
                                //已支付

                                this.showPaymentSuccess()
                            }
                        }).catch(_ => {
                            console.error('check qr status', _);
                        });
                    }, qrCheckInterval);


                    this.payOrderId = resp.data.orderId;
                    this.qrImage = true;
                });

                this.qrVisible = true;
            }
            ,
            showPaymentSuccess() {
                this.qrVisible = false;
                this.showContactTaobao = false;
                this.clearCart();
                this.paySuccessVisible = true;

                HandleBag.clear(this.paySuccessBag);
                this.paySuccessBag = new HandleBag();
                //保持不显示广告
                this.paySuccessBag.setInterval(_ => this.adsShowDebounce(), 10000);

                //检查订单状态
                let checkOrderStatus = PromiseDebounce.create(_ => {
                    return getUrl(`order/status/${this.payOrderId}`);
                });
                this.paySuccessBag.setInterval(r => {
                    checkOrderStatus().then(r => {
                        this.deliveryOrderStatus = r.data;
                    }).catch(_ => {
                        console.error('check qr status', _);
                    });
                }, deliveryCheckInterval, true);

                this.paySuccessTimer = deliveryStayDuration / 1000;
                this.paySuccessBag.setInterval(_ => {
                    this.paySuccessTimer = this.paySuccessTimer - 1;
                    if (this.paySuccessTimer < 1) {
                        if(this.deliveryOrderStatus != 40){
                            this.paySuccessVisible = false;
                            this.$nextTick(_=>{
                                this.deliveryFail();
                            })
                        }
                        else{
                            this.backToList();
                        }
                    }
                }, 1000);
            }
            ,
            deliveryFail(){
                this.paySuccessBag.clear();
                this.paySuccessTimer = 60;
                this.showContactTaobao = true;
                //保持不显示广告
                this.paySuccessBag.setInterval(_ => this.adsShowDebounce(), 10000);
                this.paySuccessBag.setInterval(_=>{
                    this.paySuccessTimer = this.paySuccessTimer - 1;
                    if(this.paySuccessTimer < 1){
                        this.backToList();
                    }
                },1000)
            },
            // confirmExitDelivery() {
            //     this.$confirm('退出出货界面？')
            //         .then(_ => {
            //             this.view = 'list';
            //         }, _ => {
            //         })
            // },
            refreshCart() {
                let r = this.cartItems.reduce((o, b) => {
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
            }
            ,
            // confirmClearCart() {
            //     this.$confirm('清空购物车？')
            //         .then(_ => {
            //             this.clearCart();
            //         })
            // }
            // ,
            clearCart() {
                this.showCartContent = false;
                for (let item of this.onsaleItems) {
                    item.buyCount = 0;
                }
                this.refreshCart();
            }
            ,
            longCut(text, length) {
                if (text.length > length) {
                    return text.substr(0, length) + '...';
                }
                else {
                    return text;
                }
            }
            ,
            getDic(status, dic, def) {
                let r = dic[status];
                return r || def;
            }
            ,
            seePromotionDetails() {

            }
        }
    });

window.__openSecretConfigPanel = function(){
    vm.showMachineInfo();
};