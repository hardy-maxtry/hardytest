"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// var rootUrl ="http://47.99.36.92:10002/";

// var resourceRoot = rootUrl;
// var apiRoot = rootUrl +'api/';
// var apiBackRoot = rootUrl +'apiBack/';


var resourceRoot = '/';
var apiRoot = 'api/';
var apiBackRoot = 'apiBack/';
// 版本号，需要和服务端保持一致
var version = "1.095";
var adShowWait = 60000; //无操作显示广告等待时间
// //todo:debug
// const adShowWait = 6000000; //无操作显示广告等待时间

var adStayDuration = 15000; //每张广告持续时间

var checkMachineDuration = 5000; //机器状态轮询时间

var checkMachineFail = 0;
var queryAdsDuration = 60000;
var queryItemDuration = 60000;
var qrWaitDuration = 60000; //二维码超时时间

var qrWaitAfterScanuration = 300000; //二维码扫描后超时时间

var qrCheckInterval = 5000; //扫码状态轮询时间

var deliveryCheckInterval = 5000; //出货状态轮询时间

var deliveryStayDuration = 30000;
!function (e) {
  var i = {},
      t = {},
      n = 0;
  e.rocNative = {
    __nativeCall: function __nativeCall(e, t, n) {
      var a = i[e];
      delete i[e], "function" == typeof a && a(t, n);
    },
    __callNative: function __callNative(t, a, o) {
      "function" == typeof o && (n++, i[n] = o);
      var r = JSON.stringify({
        name: t,
        callbackId: "function" == typeof o ? n : -1,
        param: a === undefined ? {} : a
      });

      if (e.__rocAndroid) {
        e.__rocAndroid.postMessage(r);

        return true;
      }

      if (e.webkit && window.webkit.messageHandlers.rociOS) {
        window.webkit.messageHandlers.rociOS.postMessage(r);
        return true;
      }

      return false;
    },
    __onEvent: function __onEvent(e, i) {
      if (e && i && "function" == typeof i) {
        (t[e] || (t[e] = [])).push(i);
      }
    },
    __clearEvent: function __clearEvent(e) {
      e && delete t[e];
    },
    __fireEvent: function __fireEvent(e, i) {
      var n = t[e];
      n && n.forEach(function (e) {
        e(i);
      });
    },
    on: function on(e, i) {
      rocNative.__onEvent(e, i);
    },
    off: function off(e) {
      rocNative.__clearEvent(e);
    }
  }, function () {
    Array.prototype.slice.apply(arguments).forEach(function (i) {
      e.rocNative[i] = function (t) {
        return new Promise(function (n, a) {
          e.rocNative.__callNative(i, t, function (e, i) {
            null !== e ? a({
              error: e,
              result: i
            }) : n(i);
          }) ? void 0 : n({});
        });
      };
    });
  }("appVersion", "appInit", "heartBeat", "getAppSetting", "setAppSetting");
}(window);

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
  return rocNative.getAppSetting({
    name: name
  }).then(function (r) {
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

function convertToResourceUrl(url) {
  return resourceRoot + url;
}

var vm = new Vue({
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
    showItemDetail: false,
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
        required: true,
        message: '请输入用户名'
      }],
      password: [{
        required: true,
        message: '请输入密码'
      }]
    },
    machineInfo: {
      deviceNo: '',
      shopId: ''
    },
    machineInfoRules: {
      deviceNo: [{
        required: true,
        message: '请输入机器编号'
      }],
      shopId: [{
        required: true,
        message: '请输入门店编号'
      }]
    },
    machineInfoClicks: 0,
    machineInfoClicksDebounce: null,
    paySuccessVisible: false,
    paySuccessTimer: 0,
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
    showContactTaobao: false,
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
    showEventAd: false
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
    },
    adsEvents: function adsEvents() {
      return this.ads.filter(function (a) {
        return a.positionType == 4;
      });
    }
  },
  created: function created() {
    var _this2 = this;

    this.url = window.location.href;
    rocNative.appVersion().then(function (r) {
      _this2.version = "".concat(r.appVersion);
    }).catch(function (e) {
      return console.error(e);
    });
    rocNative.appInit();
    setInterval(function (_) {
      //给App发送心跳
      rocNative.heartBeat();
    }, 3000);
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
    setInterval(function (_) {
      if (_this2.view == 'ads') {
        _this2.queryItems();
      }
    }, queryItemDuration);
    this.adsShowDebounce = _.debounce(function (_) {
      _this2.showCartContent = false;
      _this2.showItemDetail = false;
      _this2.showEventAd = false;

      _this2.clearCart();

      _this2.view = 'ads';
    }, adShowWait);
    this.machineInfoClicksDebounce = _.debounce(function (_) {
      _this2.machineInfoClicks = 0;
    }, 500);
    getInfo('deviceNo').then(function (r) {
      _this2.deviceTaobaoNo = r;
    });
  },
  watch: {
    machineError: function machineError(value) {
      if (value) {
        this.view = 'ads';
      }

      this.randomSelectAds();
    },
    showItemDetail: function showItemDetail(value) {
      if (!value) {
        this.detailItem = null;
      }
    },
    qrVisible: function qrVisible(value) {
      if (!value) {
        //清除二维码的所有计时器
        HandleBag.clear(this.qrBag);
      }
    },
    paySuccessVisible: function paySuccessVisible(value) {
      if (!value) {
        HandleBag.clear(this.paySuccessBag);
        this.queryItems();
      }
    },
    showContactTaobao: function showContactTaobao(value) {
      if (!value) {
        HandleBag.clear(this.paySuccessBag);
        this.queryItems();
      }
    },
    view: function view(value) {
      if (value != 'ads') {
        this.adsShowDebounce();
      }
    },
    machineInfoDialog: function machineInfoDialog(value) {
      //打开或关闭对话框
      this.loginToken = null;
      this.loginInfo.username = '';
      this.loginInfo.password = '';
    },
    deviceTaobaoNo: function deviceTaobaoNo(value) {
      setInfo("deviceNo", value);
      this.initMachine();
    }
  },
  methods: {
    convertToResourceUrl: convertToResourceUrl,
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
          }).catch(function (e) {
            _this4.$message({
              message: '注册失败，服务器错误，请重试',
              type: 'error'
            });
          });
        } else {
          return false;
        }
      });
    },
    initMachine: function initMachine() {
      this.clearCart();

      if (this.deviceTaobaoNo) {
        this.queryDeviceInfo();
        this.queryItems();
        this.queryAds();
      }
    },
    queryAds: function queryAds() {
      var _this5 = this;

      if (this.deviceTaobaoNo) {
        getUrl('advert/list', {
          deviceTaobaoNo: this.deviceTaobaoNo
        }).then(function (resp) {
          _this5.ads = resp.data.map(function (ad) {
            ad.image = convertToResourceUrl(ad.image);
            return ad;
          }); // if (this.adsShowing.length > 0) {
          //     this.view = 'ads';
          // }

          _this5.randomSelectAds();
        }).catch(function (resp, status, err) {
          _this5.$message(resp.statusText);
        });
      }
    },
    queryDeviceInfo: function queryDeviceInfo() {
      var _this6 = this;

      if (this.deviceTaobaoNo) {
        getUrl('device/detail', {
          deviceTaobaoNo: this.deviceTaobaoNo
        }).then(function (resp) {
          if (resp.data.status > 0) {
            _this6.deviceInfo = resp.data;
            _this6.machineError = false;
          } else {
            _this6.machineError = true;
          } //判断版本，刷新页面


          if (resp.data.version != version) {// todo: debug
            // window.location.reload()
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
      this.view = 'list';

      var item = ad && _.find(this.onsaleItems, function (item) {
        return item.taobaoNo == ad.url;
      }); //taobaoNumber


      if (item) {
        this.selectItem(item);
      } else {
        this.showEventAd = true;
      }
    },
    everyClick: function everyClick() {
      this.adsShowDebounce();
    },
    queryItems: function queryItems() {
      var _this7 = this;

      if (this.deviceTaobaoNo) {
        getUrl('product/list', {
          deviceTaobaoNo: this.deviceTaobaoNo
        }).then(function (resp) {
          return _this7.onsaleItems = resp.data.map(function (d) {
            var images = (d.images || []).map(function (i) {
              return convertToResourceUrl(i);
            });
            var detailImages = (d.detailImages || []).map(function (i) {
              return convertToResourceUrl(i);
            });
            return _objectSpread({}, d, {
              taobaoNo: d.productTaobaoNo,
              title: d.name,
              detailImages: detailImages.length > 0 ? detailImages : images,
              images: images.length > 0 ? images : ['download.jpg'],
              buyCount: 0,
              description: '',
              promotions: d.promotion,
              tags: (d.tag || '').split(',').filter(function (t) {
                return t;
              }).map(function (t) {
                return convertToResourceUrl(t);
              })
            });
          });
        });
      }
    },
    addItem: function addItem(item, evt) {
      var _this8 = this;

      if (item.buyCount < item.stock) {
        item.buyCount = item.buyCount + 1;
        this.refreshCart();
        this.flyTo($("<div class=\"fly-icon\"><img src=\"".concat(item.cover || 'taobao-logo.png', "\"></div>")), evt.target, this.$refs.cartIcon).then(function (_) {
          _this8.doAnimate(_this8.$refs.cartIcon, 'pulse');
        });
      }
    },
    flyTo: function flyTo(flyItem, source, target) {
      var _this9 = this;

      return new Promise(function (rs, rj) {
        var xy = $(source).offset();
        $(flyItem).offset(xy);
        $("body").append(flyItem);

        _this9.$nextTick(function (_) {
          var txy = $(target).offset();
          flyItem.offset(txy).one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function (_) {
            flyItem.remove();
            rs();
          });
        });
      });
    },
    doAnimate: function doAnimate(el, name) {
      $(el).removeClass("animated ".concat(name));
      this.$nextTick(function (_) {
        $(el).addClass("animated ".concat(name)).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (event) {
          $(el).removeClass("animated ".concat(name));
        });
      });
    },
    removeItem: function removeItem(item) {
      item.buyCount = Math.max(0, item.buyCount - 1);
      this.refreshCart();
    },
    selectItem: function selectItem(item) {
      var _this10 = this;

      if (item.detailInfo) {
        this.detailItem = item;
        this.showItemDetail = true;
      } else {
        getUrl("/product/detail/".concat(this.deviceTaobaoNo, "/").concat(item.taobaoNo)).then(function (data) {
          var detailItem = data.data;
          item.rate = detailItem.score; // item.content = detailItem.content;

          item.description = detailItem.content;
          item.detailInfo = detailItem;
          _this10.detailItem = item;
          _this10.showItemDetail = true;
        });
      }
    },
    backToList: function backToList() {
      this.detailItem = null;
      this.showItemDetail = false;
      this.qrVisible = false;
      this.paySuccessVisible = false;
      this.showContactTaobao = false;
      this.view = 'list';
    },
    showQR: function showQR() {
      var _this11 = this;

      if (this.cartItems.length == 0) {
        return;
      }

      this.showItemDetail = false;
      this.qrImage = false;
      this.payOrderId = null;
      HandleBag.clear(this.qrBag);
      this.qrBag = new HandleBag(); //保持不显示广告

      this.qrBag.setInterval(function (_) {
        return _this11.adsShowDebounce();
      }, 10000);
      this.qrTimer = Math.round(qrWaitDuration / 1000);
      this.qrBag.setInterval(function (_) {
        //QR倒计时
        _this11.qrTimer = _this11.qrTimer - 1;

        if (_this11.qrTimer < 1) {
          _this11.qrVisible = false;
        }
      }, 1000);
      var scaned = false;
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
        }),
        action: 'ews',
        scanUrl: "mfsjst.ewssh.m.jaeapp.com/ews_shoutao_test/index.html" // scanUrl: "mfsjst.ewssh.m.jaeapp.com/ews_shoutao_test/index.html",

      }).then(function (resp) {
        if (!_this11.qrCreator) {
          _this11.qrCreator = new QRCode(document.getElementById("payQR"), {
            text: resp.data.qrcode,
            width: 400,
            height: 400,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
          });
        } else {
          _this11.qrCreator.clear();

          _this11.qrCreator.makeCode(resp.data.qrcode);
        }

        var checkOrderStatus = PromiseDebounce.create(function (_) {
          return getUrl("order/status/".concat(_this11.payOrderId));
        });

        _this11.qrBag.setInterval(function (r) {
          checkOrderStatus().then(function (r) {
            if (r.data == 11 && !scaned) {
              _this11.qrTimer = Math.round(qrWaitAfterScanuration / 1000);
              scaned = true;
            }

            if (_.includes([-30, -20, -10, 2, 10, 20, 40], r.data)) {
              //已支付
              _this11.showPaymentSuccess();
            }
          }).catch(function (_) {
            console.error('check qr status', _);
          });
        }, qrCheckInterval);

        _this11.payOrderId = resp.data.orderId;
        _this11.qrImage = true;
      });
      this.qrVisible = true;
    },
    showPaymentSuccess: function showPaymentSuccess() {
      var _this12 = this;

      this.qrVisible = false;
      this.showContactTaobao = false;
      this.clearCart();
      this.paySuccessVisible = true;
      HandleBag.clear(this.paySuccessBag);
      this.paySuccessBag = new HandleBag(); //保持不显示广告

      this.paySuccessBag.setInterval(function (_) {
        return _this12.adsShowDebounce();
      }, 10000); //检查订单状态

      var checkOrderStatus = PromiseDebounce.create(function (_) {
        return getUrl("order/status/".concat(_this12.payOrderId));
      });
      this.paySuccessBag.setInterval(function (r) {
        checkOrderStatus().then(function (r) {
          _this12.deliveryOrderStatus = r.data;
        }).catch(function (_) {
          console.error('check qr status', _);
        });
      }, deliveryCheckInterval, true);
      this.paySuccessTimer = deliveryStayDuration / 1000;
      this.paySuccessBag.setInterval(function (_) {
        _this12.paySuccessTimer = _this12.paySuccessTimer - 1;

        if (_this12.paySuccessTimer < 1) {
          if (_this12.deliveryOrderStatus != 40) {
            _this12.paySuccessVisible = false;

            _this12.$nextTick(function (_) {
              _this12.deliveryFail();
            });
          } else {
            _this12.backToList();
          }
        }
      }, 1000);
    },
    deliveryFail: function deliveryFail() {
      var _this13 = this;

      this.paySuccessBag.clear();
      this.paySuccessTimer = 60;
      this.showContactTaobao = true; //保持不显示广告

      this.paySuccessBag.setInterval(function (_) {
        return _this13.adsShowDebounce();
      }, 10000);
      this.paySuccessBag.setInterval(function (_) {
        _this13.paySuccessTimer = _this13.paySuccessTimer - 1;

        if (_this13.paySuccessTimer < 1) {
          _this13.backToList();
        }
      }, 1000);
    },
    // confirmExitDelivery() {
    //     this.$confirm('退出出货界面？')
    //         .then(_ => {
    //             this.view = 'list';
    //         }, _ => {
    //         })
    // },
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
    // confirmClearCart() {
    //     this.$confirm('清空购物车？')
    //         .then(_ => {
    //             this.clearCart();
    //         })
    // }
    // ,
    clearCart: function clearCart() {
      this.showCartContent = false;
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
          if (!_iteratorNormalCompletion && _iterator.return != null) {
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

window.__openSecretConfigPanel = function () {
  vm.showMachineInfo();
};
