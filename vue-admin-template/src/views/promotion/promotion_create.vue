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
          <el-form-item label="促销类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择促销类型">
              <el-option label="定额" value="1"/>
              <el-option label="折扣" value="2"/>
              <el-option label="满减" value="3"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="限制生效次数" prop="allowTimes">
            <el-input v-model="form.allowTimes"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="折扣金额" prop="discount">
            <el-input v-model="form.discount"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="售货机" prop="deviceTaobaoNo">
            <el-select v-model="form.deviceTaobaoNo" placeholder="请选择售货机">
              <el-option v-for="(item, index) in machines" :label="item.deviceShowName" :value="item.deviceTaobaoNo" :key="index"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品ID" prop="productTaobaoNo">
            <!-- <el-input v-model="form.productTaobaoNo" placeholder="输入商品名称查询"></el-input> -->
              <el-select
                v-model="form.productTaobaoNo"
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
      </el-row>
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
        <el-button type="primary" @click="onSubmit">创建</el-button>
      </el-form-item>
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
  data() {
    return {
      form: {
        "allowTimes": 0,  //允许次数,int
        "beginTime": new Date(new Date().getTime()-7*24*3600*1000), //开始时间,Date
        "code": "string", // 促销code,string
        "discount": 0, // 折扣额度,float
        "endTime": new Date(new Date().getTime()+7*24*3600*1000),//结束时间,Date
        "item": [
          {
            "deviceTaobaoNo": "string", // 淘宝售货机ID
            "limitQuantity": 0, // 限购数量
            "productTaobaoNo": "string", // 淘宝商品ID
            "shopId": 0 // 店铺ID
          }
        ],
        "limitQuantity": 0, // 限制数量? 这个不理解
        "name": "string", // 促销名称
        "price": 0, // 定额? 这个不理解 
        "subtraction": 0, //满减金额? 这个不理解 
        "total": 0, // 满减总额? 这个不理解 
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
        deviceTaobaoNo: [
            { required: true, message: '请选择广告类型', trigger: 'change' },
        ],
        productTaobaoNo: [
            { required: true, message: '请选择商品', trigger: 'change' },
        ],
          // name: [
          //   { required: true, message: '请输入活动名称', trigger: 'change' },
          //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
          // ],
      },
      options4: [],
      loading: false,
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
    onSubmit() {
        this.$refs['adCreateForm'].validate((valid) => {
          if (valid) {
            this.$message('正在保存')
            this.createPromotion();
            // this.getAd();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    createPromotion(){
      let that = this;
      let postData = JSON.parse(JSON.stringify(this.form))
      postData.beginTime = parseTime(postData.beginTime,'{y}-{m}-{d}');
      postData.endTime =  parseTime(postData.endTime,'{y}-{m}-{d}');
      console.log(postData)
      return;
      axios.post(`${urls.promotion_add}`, postData)
        .then(function(res){
          
          that.$message({
              message: '保存成功，请到商品排期页面查看!',
              type: 'success'
            })
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
      console.log(arguments);
      // debugger
      if(this.form.beginTime != null && this.form.beginTime != '' && this.form.endTime != null && this.form.endTime != ''
          && this.form.beginTime.getTime() > this.form.endTime.getTime()){
            callback(new Error('开始日期不能晚于结束日期'));
          }
      callback();
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
</style>

