<template>
  <div class="app-container">
    <el-form ref="adCreateForm" :rules="rules" :model="form" label-width="120px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="促销名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="参加次数" prop="allowTimes">
            <!-- <el-input v-model="form.allowTimes" style="width:90%;"></el-input> -->
            <el-input-number v-model="form.allowTimes" ></el-input-number>
            
            <el-tooltip class="item" effect="dark" content="每位客户可以参加几次活动" placement="top-start">
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
              <el-option label="定额" value="1"/>
              <el-option label="满额折扣" value="2"/>
              <el-option label="满额立减" value="3"/>
            </el-select>
            <el-tooltip class="item" effect="dark" placement="top-start">
              <div slot="content">
                定额：只要选购了活动商品，就视为满足活动条件，活动商品总结算价 = 固定折扣价，建议作为限购优惠来使用<br/>
                满额折扣：满足条件后，活动商品总结算价 = 活动商品总价 x 满额折扣比例<br/>
                满额立减：满足条件后，活动商品总结算价 = 活动商品总价 - 满额立减额度</div>
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
          <el-form-item v-if="form.type==1" label="固定折扣价(元)" prop="price">
            <!-- <el-input v-model="form.price"></el-input> -->
            <el-input-number v-model="form.price" :precision="2" :step="1" ></el-input-number>
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
        <el-col :span="8">
          <el-form-item label="商品ID" prop="pageProductTaobaoNo">
            <!-- <el-input v-model="form.productTaobaoNo" placeholder="输入商品名称查询"></el-input> -->
              <el-select
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
              </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="限购件数" prop="pageLimitQuantity">
            <!-- <el-input v-model="pageLimitQuantity"></el-input> -->
            <el-input-number v-model="pageLimitQuantity"  ></el-input-number>
            <el-tooltip class="item" effect="dark" content="一位顾客参与一次活动中，最多可以够买几件商品，超出部分将以原价结算" placement="top-start">
              <i class="el-icon-question"></i>
            </el-tooltip>
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
          <el-form-item label="结束日期" prop="saleDateEnd">
            <el-date-picker v-model="form.endTime" type="date" placeholder="结束日期" style="width: 100%;"/>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- </el-form-item> -->
      
      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import axios from '@/utils/ajax';
import urls from '@/config/urls';
import getQueryString from '@/utils/getQueryString';

import {parseTime} from '@/utils/index';
let adTypes = {
  0 : '图片',
  1 : '链接',
}
export default {
  data() {
    return {
      form: {
        "id": 0 , //促销ID
        "allowTimes": 1,  //允许次数,int
        "beginTime": new Date(new Date().getTime()), //开始时间,Date
        "code": "", // 促销code,string
        
        "endTime": new Date(new Date().getTime()+30*24*3600*1000),//结束时间,Date
        "item": [
          {
            "deviceTaobaoNo": null, // 淘宝售货机ID
            "limitQuantity": 0, // 限购数量
            "productTaobaoNo": "string", // 淘宝商品ID
            "shopId": null, // 店铺ID,
            "id":null,
            "proId": null,
          }
        ],
        "limitQuantity": 0, // 限制数量? item列表中的商品，参加一次优惠，限制的购买数量，超出部分不参加优惠
        "name": "", // 促销名称
        "price": 0, // 定额? type=1时，满足活动商品数量后，参加活动的商品以price的值作为固定金额结算
        "subtraction": 0, //满减金额? type=3时, 活动商品一次性购买足量金额后，将减去 subtraction 的金额
        "total": 0, // 满减总额? 活动商品一次性购买足量金额后，触发discount或者  subtraction
        "discount": 0, // 折扣百分比,float, 8折就填0.8. type=2时, 活动商品一次性购买足量金额后，将乘以discount的数字，作为最终结算金额
        "type": "1" // 1=定额，2=折扣，3=满减
      },
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
        pageProductTaobaoNo: [
            // { required: true, message: '请选择商品', trigger: 'change' },
            { validator: this.checkPageProductTaobaoNo, trigger: 'change' }
        ],
        price: [
            {type: 'number', message: '折扣价必须是数字', trigger: 'change' },
            { validator: this.checkPrice, trigger: 'change' },

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
      pageProductTaobaoNo : '',
      pageLimitQuantity : 1,
      promotion_sys_id : null,
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

    
    let promotion_sys_id = getQueryString('id');
    // console.log('itemsysid',promotion_sys_id)
    if(promotion_sys_id == null){
      this.$router.push({path:'/promotion/promotion_list'});
      return;
    }
    this.promotion_sys_id = promotion_sys_id;
    axios.get(`${urls.promotion_detail}${promotion_sys_id}`)
      .then(function(data){
        console.log(data);
        that.form = data.data;
        that.$set(that.form, 'type', that.form.type.toString());        
        that.$set(that.form, 'beginTime', new Date(that.form.beginTime));        
        that.$set(that.form, 'endTime', new Date(that.form.endTime));        
        that.$set(that, 'pageProductTaobaoNo', that.form.item[0].productTaobaoNo);
        that.$set(that, 'pageLimitQuantity', that.form.item[0].limitQuantity);
      })
  },
  methods: {
    onSubmit() {
        this.$refs['adCreateForm'].validate((valid) => {
          if (valid) {
            this.$message('正在保存')
            this.modifyPromotion();
            // this.getAd();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    modifyPromotion(){
      let that = this;
      let postData = JSON.parse(JSON.stringify(this.form))
      postData.beginTime = parseTime(postData.beginTime,'{y}-{m}-{d}');
      postData.endTime =  parseTime(postData.endTime,'{y}-{m}-{d}');
      postData.item[0].limitQuantity =  this.pageLimitQuantity;
      postData.item[0].productTaobaoNo =  this.pageProductTaobaoNo;
      postData.status = 1;
      console.log(postData)
      // return;
      axios.post(`${urls.promotion_modify}`, postData)
        .then(function(res){
          console.log(res);
          if(res.data !== false){
            that.$message({
              message: '保存促销成功，请重新审核!',
              type: 'success'
            })
          }else{
            that.$message({
              message: '保存促销失败，请联系管理员!',
              type: 'warning'
            })
          }
          
        })
        .catch(function(error){
          console.log(error)

        })
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    },
    
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
      // debugger
      if(this.form.beginTime != null && this.form.beginTime != '' && this.form.endTime != null && this.form.endTime != ''
          && this.form.beginTime.getTime() > this.form.endTime.getTime()){
            callback(new Error('开始日期不能晚于结束日期'));
          }
      callback();
    },
    checkPageProductTaobaoNo(rule, value, callback){
      // console.log(arguments);
      // debugger
      if(this.pageProductTaobaoNo == null || this.pageProductTaobaoNo == ''){
            callback(new Error('请选择活动商品'));
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

