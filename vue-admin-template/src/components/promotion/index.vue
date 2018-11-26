<template>
  <div class="app-container">
    <el-form ref="promotionForm" :rules="rules" :model="form" label-width="120px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="促销名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="活动参加次数" prop="allowTimes">
            <!-- <el-input v-model="form.allowTimes" style="width:90%;"></el-input> -->
            <el-input-number v-model="form.allowTimes" ></el-input-number>
            
            <el-tooltip class="item" effect="dark" content="每位客户可以参加几次活动，0为不限制" placement="top-start">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-form-item>
        </el-col>
      </el-row>
      <hr class="style-one"/>
      <el-row>
        <el-col :span="8">
          <el-form-item label="促销类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择促销类型" style="width:90%;">
              <!-- <el-option label="定额" value="1" :disabled="false"/>
              <el-option label="满额折扣" value="2" :disabled="false"/>
              <el-option label="满额立减" value="3" :disabled="false"/> -->       
              <el-option
                v-for="item in conditionTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled">
              </el-option>
            </el-select>
            <el-tooltip class="item" effect="dark" placement="top-start">
              <div slot="content">
                定额：只要选购足量活动商品，就可以以活动价购买这些商品，活动商品总结算价 = 固定折扣价，例如，设置数量=2，折扣价5元，则顾客购买两件活动商品时，总共只需要支付5元
                <!-- <br/> -->
                <!-- 满额折扣：满足条件后，活动商品总结算价 = 活动商品总价 x 满额折扣比例<br/> -->
                <!-- 满额立减：满足条件后，活动商品总结算价 = 活动商品总价 - 满额立减额度 -->
                </div>
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="8">
            <el-form-item label="订单可用次数" prop="limitQuantity">
                <!-- <el-input v-model="pageLimitQuantity"></el-input> -->
                <el-input-number v-model="form.limitQuantity"  ></el-input-number>
                <el-tooltip class="item" effect="dark" content="单个订单中，可以参加几次活动，0为不限制" placement="top-start">
                <i class="el-icon-question"></i>
                </el-tooltip>
            </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">

          <el-form-item v-if="form.type==3 || form.type == 2" label="达标金额(元)" prop="total">
            <!-- <el-input v-model="form.total" type="number"></el-input> -->
            <el-input-number v-model="form.total" :precision="2" :step="1" ></el-input-number>
          </el-form-item>
          <el-form-item v-if="form.type==4" label="满X件享折扣" prop="quotaQuantity">
            <!-- <el-input v-model="form.total" type="number"></el-input> -->
            <el-input-number v-model="form.quotaQuantity"  :step="1" ></el-input-number>
            <el-tooltip class="item" effect="dark" content="单个订单中，购买指定数量的指定商品，可以享受折扣价结算" placement="top-start">
                <i class="el-icon-question"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item v-if="form.type==1" label="限购数量" prop="quotaQuantity">
            <!-- <el-input v-model="form.total" type="number"></el-input> -->
            <el-input-number v-model="form.quotaQuantity" :disabled="true" :step="1" ></el-input-number>
            <el-tooltip class="item" effect="dark" content="限购商品只允许购买一件" placement="top-start">
                <i class="el-icon-question"></i>
            </el-tooltip>
          </el-form-item>
          
        </el-col>
        <el-col :span="8">
          <el-form-item v-if="form.type==2" label="折扣百分比(1-99)" prop="discount">
            <!-- <el-input v-model="form.discount"></el-input> -->
            <el-input-number v-model="form.discount" :precision="2" :step="1"  :max="100"></el-input-number>
          </el-form-item>
          <el-form-item v-if="form.type==3" label="立减金额(元)" prop="subtraction">
            <!-- <el-input v-model="form.subtraction"></el-input> -->
            <el-input-number v-model="form.subtraction" :precision="2" :step="1" ></el-input-number>

          </el-form-item>
          <el-form-item v-if="form.type==1 || form.type==4" label="固定折扣价(元)" prop="price">
            <!-- <el-input v-model="form.price"></el-input> -->
            <el-input-number v-model="form.price" :precision="2" :step="1" ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      <hr class="style-one"/>
      <el-row>
        <!-- <el-col :span="8">
          <el-form-item label="售货机" prop="deviceTaobaoNo">
            <el-select v-model="form.deviceTaobaoNo" placeholder="请选择售货机">
              <el-option v-for="(item, index) in machines" :label="item.deviceShowName" :value="item.deviceTaobaoNo" :key="index"/>
            </el-select>
          </el-form-item>
        </el-col> -->
        <el-col :span="16">
          <el-form-item label="商品列表" prop="item" class="dynamic_product">
            <!-- <el-input v-model="form.productTaobaoNo" placeholder="输入商品名称查询"></el-input> -->
              <!-- <el-select
                v-model="pageProductTaobaoNo"
                filterable
                placeholder="输入商品名称"
                :loading="loading">
                <el-option
                  v-for="item in options4"
                  :key="item.productTaobaoNo"
                  :label="item.name"
                  :value="item.productTaobaoNo">
                    <span style="float: left">{{ item.productTaobaoNo }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
                </el-option>
              </el-select> -->
          
          <el-button @click="addProduct">新增商品</el-button>
            <el-row v-for="(product, index) in form.item" :key="index">
              <el-col :span="12">
                <el-form-item
                    
                    :label="'商品' + index"
                    
                    :prop="'item.' + index + '.productTaobaoNo'"
                    :rules="{ validator: checkFormDuplicate, trigger: 'change' }"
                    label-width="80px"
                >
                    <!-- <el-input v-model="product.productTaobaoNo" style="width:50%;"></el-input> -->
                    <el-select
                        v-model="product.productTaobaoNo"
                        filterable
                        placeholder="输入商品名称"
                        :loading="loading"
                        clearable
                        style="width:90%;">
                        <el-option
                        v-for="item in options4"
                        :key="item.productTaobaoNo"
                        :label="item.name"
                        :value="item.productTaobaoNo"
                        >
                            <span style="float: left">{{ item.productTaobaoNo }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
                        </el-option>
                    </el-select>
                    
                    
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="折扣商品号">
                <el-input v-model="product.extraProductTaobaoNo" style="width:70%;"></el-input>
                <el-button @click.prevent="removeProduct(product)">删除</el-button>
                </el-form-item>
              </el-col>
            </el-row>
            </el-form-item>
        </el-col>
        
      </el-row>
      <hr class="style-one"/>
      <el-row>
      <!-- <el-form-item label="生效期" > -->
        <el-col :span="8">
          <el-form-item label="开始日期" prop="beginTime">
            <el-date-picker v-model="form.beginTime" type="date" placeholder="开始日期" style="width: 100%;"/>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="2" class="line">-</el-col> -->
        <el-col :span="8">
          <el-form-item label="结束日期" prop="endTime">
            <el-date-picker v-model="form.endTime" type="date" placeholder="结束日期" style="width: 100%;"/>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- </el-form-item> -->
      
      <!-- <el-form-item>
        <el-button type="primary" @click="onSubmit">创建</el-button>
      </el-form-item> -->
    </el-form>

  </div>
</template>

<script>
import axios from '@/utils/ajax';
import urls from '@/config/urls';

import {parseTime} from '@/utils/index';
let adTypes = {
  0 : '图片',
  1 : '链接',
}
export default {
    props:{
        promotion_form : {
            type : Object
        },
        
    },
    watch : {
      promotion_form : function(newVal, oldVal){
          this.form = newVal;
      },
      "form.type" : function(newVal, oldVal){
          if(newVal == '1'){
            this.$set(this.form, 'quotaQuantity', 1);
          }
      },
      
  },
  data() {
    return {
    //   form: {
    //     "allowTimes": 1,  //允许次数,int
    //     "beginTime": new Date(new Date().getTime()), //开始时间,Date
    //     "code": "", // 促销code,string
        
    //     "endTime": new Date(new Date().getTime()+30*24*3600*1000),//结束时间,Date
    //     "item": [
    //       {
    //         "deviceTaobaoNo": "string", // 淘宝售货机ID
    //         "limitQuantity": 0, // 限购数量
    //         "productTaobaoNo": "string", // 淘宝商品ID
    //         "shopId": 0 // 店铺ID
    //       }
    //     ],
    //     "limitQuantity": 0, // 限制数量? item列表中的商品，参加一次优惠，限制的购买数量，超出部分不参加优惠
    //     "name": "", // 促销名称
    //     "price": 0, // 定额? type=1时，满足活动商品数量后，参加活动的商品以price的值作为固定金额结算
    //     "subtraction": 0, //满减金额? type=3时, 活动商品一次性购买足量金额后，将减去 subtraction 的金额
    //     "total": 0, // 满减总额? 活动商品一次性购买足量金额后，触发discount或者  subtraction
    //     "discount": 0, // 折扣百分比,float, 8折就填0.8. type=2时, 活动商品一次性购买足量金额后，将乘以discount的数字，作为最终结算金额
    //     "type": "1", // 1=定额，2=折扣，3=满减
    //     quotaQuantity: 1 // 满X件触发折扣
    //   },
    form: this.promotion_form,
      fileList: [],
      machines : [{
        name : '售货机一号',id:1
      },{
        name : '售货机老大',id:2
      }],
      rules:{
        // deviceTaobaoNo: [
        //     { required: true, message: '请选择机器ID', trigger: 'change' },
        // ],
        beginTime: [
            { required: true, message: '请选择开始日期', trigger: 'change' },
            { validator: this.compareTime, trigger: 'change' }
        ],
        endTime: [
            { required: true, message: '请选择结束日期', trigger: 'change' },
            { validator: this.compareTime, trigger: 'change' }
        ],
        name: [
            { required: true, message: '请填写活动名称', trigger: 'change' },
            //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
        ],
        item: [
            // { required: true, message: '请选择商品', trigger: 'change' },
            { validator: this.checkFormItem, trigger: 'change' }
        ],
        allowTimes :[
            {type: 'number', message: '参与次数必须是数字', trigger: 'change' },
            { validator: this.checkTimes, trigger: 'change' },
        ],
        limitQuantity:[
            {type: 'number', message: '参与次数必须是数字', trigger: 'change' },
            { validator: this.checkTimes, trigger: 'change' },
        ],
        price: [
            {type: 'number', message: '折扣价必须是数字', trigger: 'change' },
            { validator: this.checkPrice, trigger: 'change' },

            //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
        ],
        quotaQuantity: [
            {type: 'number', message: '数量必须是数字', trigger: 'change' },
            { validator: this.checkQty, trigger: 'change' },

            //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
        ],
        total:[
            {required: true, type: 'number', message: '请输入数字格式的达标金额', trigger: 'change' },
            { validator: this.checkTotal, trigger: 'change' },

            //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
        ],
        subtraction: [
            {type: 'number', message: '立减金额必须是数字', trigger: 'change' },
            { validator: this.checkPrice, trigger: 'change' },

            //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
        ],
        discount: [
            {type: 'number', message: '打折额度必须是数字', trigger: 'change' },
            { validator: this.checkDiscount, trigger: 'change' },

            //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
        ],
          // name: [
          //   { required: true, message: '请输入活动名称', trigger: 'change' },
          //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
          // ],
      },
      options4: [],
      loading: false,
      pageProductTaobaoNo : [],
      pageLimitQuantity : 1,
      conditionTypes: [{
          value: '1',
          label: '限购'
        },
        {
          value: '4',
          label: '满X件X元'
        },
        //  {
        //   value: '2',
        //   label: '满额折扣',
        //   disabled: true
        // }, {
        //   value: '3',
        //   label: '满额立减',
        //   disabled: true
        // }
        ],
    }
  },
  mounted(){
    // console.log(urls.ad_list);
    let that = this;
    axios.get(`${urls.device_list}?showName=`)
      .then(function(data){
        console.log(data);
        that.machines = data.data;
      });
    let postData = 
        {
          "name": '',
          "pageIndex": 0,
          "pageSize": 100,
          "productTaobaoNo": ""
        };
    axios.post(`${urls.product_list}`, postData)
      .then(function(res){
        // console.log(res.data.data);
        that.options4 = res.data.data;
        that.loading = false;
      }).catch(function(error){
        console.log(error);
        that.loading = false;
      })
  },
  methods: {
      getPromotionForm(){
          let that =this;
          return new Promise(function(rs, rj){
              that.$refs['promotionForm'].validate((valid) => {
                if (valid) {
                    that.$message('正在保存')
                    rs(that.form);
                    // this.getAd();
                } else {
                    console.log('error submit!!');
                    rj(false);
                }
                })
          })
        
          
      },
    // onSubmit() {
    //     this.$refs['promotionForm'].validate((valid) => {
    //       if (valid) {
    //         this.$message('正在保存')
    //         this.createPromotion();
    //         // this.getAd();
    //       } else {
    //         console.log('error submit!!');
    //         return false;
    //       }
    //     });
    //   // this.$message('submit!')
    // },
    // createPromotion(){
    //   let that = this;
    //   let postData = JSON.parse(JSON.stringify(this.form))
    //   postData.beginTime = parseTime(postData.beginTime,'{y}-{m}-{d}');
    //   postData.endTime =  parseTime(postData.endTime,'{y}-{m}-{d}');
    //   postData.item = [{
    //     deviceTaobaoNo : null,
    //     limitQuantity : this.pageLimitQuantity,
    //     productTaobaoNo : this.pageProductTaobaoNo,
    //     shopId : null,
    //   }]
    //   postData.code = new Date().getTime().toString()
    //   console.log(postData)
    //   // return;
    //   axios.post(`${urls.promotion_add}`, postData)
    //     .then(function(res){
    //       console.log(res);
    //       if(res.data !== false){
    //         that.$message({
    //           message: '创建促销成功，请到促销列表页面查看!',
    //           type: 'success'
    //         })
    //       }else{
    //         that.$message({
    //           message: '创建促销失败，请联系管理员!',
    //           type: 'warning'
    //         })
    //       }
          
    //     })
    //     .catch(function(error){
    //       console.log(error)

    //     })
    // },
    // onCancel() {
    //   this.$message({
    //     message: 'cancel!',
    //     type: 'warning'
    //   })
    // },
    
    // remoteMethod(query) {
    //   if (query !== '') {
    //     this.loading = true;
        
    //     let postData = 
    //         {
    //           "name": query,
    //           "pageIndex": 0,
    //           "pageSize": 10,
    //           "productTaobaoNo": ""
    //         };
    //     let that = this;
    //     axios.post(`${urls.product_list}`, postData)
    //       .then(function(res){
    //         console.log(res.data.data);
    //         that.options4 = res.data.data;
    //         that.loading = false;
    //       }).catch(function(error){
    //         console.log(error);
    //         that.loading = false;
    //       })
    //   } else {
    //     this.options4 = [];
    //   }
    // },
    compareTime(rule, value, callback){
      // console.log(arguments);
      if(this.form.beginTime != null && this.form.beginTime != '' && this.form.endTime != null && this.form.endTime != ''
          && this.form.beginTime.getTime() > this.form.endTime.getTime()){
            callback(new Error('开始日期不能晚于结束日期'));
          }
      callback();
    },
    checkFormItem(rule, value, callback){
      // console.log(arguments);
      if(this.form.item == null || this.form.item == ''){
            callback(new Error('请选择活动商品'));
          }
    
      callback();
    },
    checkFormDuplicate(rule,value,callback){
        if(value == null || value == ''){
            callback(new Error('活动商品不允许为空'));
        }
        let found = this.form.item.filter(x=>{
            return x.productTaobaoNo == value;
        }).length >1;
        if(found ){
            callback(new Error('活动商品不允许重复'));
        }
        callback();
    },
    checkPrice(rule, value, callback){
      // console.log(arguments);
      // debugger
      if(value <= 0){
            callback(new Error('折扣价必须大于0'));
          }
      callback();
    },
    checkTimes(rule, value, callback){
      // console.log(arguments);
      // debugger
      if(value < 0){
            callback(new Error('参与次数必须大于等于0'));
          }
      callback();
    },
    checkTotal(rule, value, callback){
      // console.log(arguments);
      // debugger
      if(value <= 0){
            callback(new Error('达标金额必须大于0'));
          }
      callback();
    },
    checkDiscount(rule, value, callback){
      // console.log(arguments);
      // debugger
      if(value <= 0 || value >= 100){
            callback(new Error('折扣百分比必须在1-99之间'));
          }
      callback();
    },
    checkQty(rule, value, callback){
      // console.log(arguments);
      // debugger
      if(value <= 0){
            callback(new Error('数量必须大于0'));
          }
      callback();
    },
    removeProduct(item){
        console.log(arguments);
        var index = this.form.item.indexOf(item)
        if (index !== -1) {
          this.form.item.splice(index, 1)
        }
    },
    addProduct(){
        this.form.item.push({
            productTaobaoNo : ''
        })
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
.el-select {
  width: 100%;
}

hr.style-two {/*透明渐变水平线*/
width:80%;
margin:0 auto;
border: 0;
height: 1px;
background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
}
hr.style-one {/*内嵌水平线*/
width:100%;
margin:0 auto;
border: 0;
height: 0;
border-top: 1px solid rgba(0, 0, 0, 0.1);
border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

</style>

<style >
.dynamic_product .el-form-item__error{
    position: relative;
}
</style>