<template>
  <div class="app-container">
    <el-form ref="adSearchForm" :rules="rules" :model="form" label-width="120px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="促销名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
        </el-col>

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
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
<el-table
        :data="promotionListTableData"
        stripe
        style="width: 100%"
        >
        <!-- <el-table-column
          type="selection"
          width="55"/> -->
        <el-table-column
          prop="id"
          label="促销ID"
          width="100">
        </el-table-column>
        <el-table-column
          prop="name"
          label="商品名称"
          >
        </el-table-column>
        <el-table-column
          prop="typeStr"
          label="促销类型"
          >
        </el-table-column>
        
        <el-table-column
          prop="beginTimeStr"
          label="促销开始日期"
          >
        </el-table-column>
        <el-table-column
          prop="endTimeStr"
          label="促销结束日期"
          >
        </el-table-column>
        <el-table-column
          prop="statusStr"
          label="审核状态"
          >
          <template slot-scope="scope">
            <span v-if="scope.row.status==1" style="color:#5baf5b;">{{ scope.row.statusStr }}</span>
            <span v-else-if="scope.row.status==2" style="color:#f78989;">{{ scope.row.statusStr }}</span>
            <span v-else>{{ scope.row.statusStr }}</span>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="300">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
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
let promotionTypes = {
  1: "定额" ,
  2: "满额折扣",
  3: "满额立减"
}
export default {
  data() {
    return {
      form: {
        "beginTime": new Date(new Date().getTime()-7*24*3600*1000), //开始时间,Date
        "endTime": new Date(new Date().getTime()+7*24*3600*1000),//结束时间,Date
        "name": "", // 促销名称
        "type": "1", // 1=定额，2=折扣，3=满减
        "pageIndex": 1,
        "pageSize": 100,
      },
      fileList: [],
      promotionListTableData: [],
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
        // name: [
        //     { required: true, message: '请填写活动名称', trigger: 'change' },
        //     //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
        // ],
        
          // name: [
          //   { required: true, message: '请输入活动名称', trigger: 'change' },
          //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
          // ],
      },
      options4: [],
      loading: false,
      pageProductTaobaoNo : '',
      pageLimitQuantity : 1,
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
        this.$refs['adSearchForm'].validate((valid) => {
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
      // return;
      axios.post(`${urls.promotion_list}`, postData)
        .then(function(res){
          if(res.data){
            that.promotionListTableData = res.data.data;
            that.promotionListTableData.forEach(x=>{
              x.typeStr = promotionTypes[x.type];
              x.beginTimeStr = parseTime(x.beginTime,'{y}-{m}-{d}');
              x.endTimeStr =  parseTime(x.endTime,'{y}-{m}-{d}');
            })
            that.$message({
              message: '查询成功!',
              type: 'success'
            })
          }else{
            that.$message({
              message: '查询失败，请联系管理员!',
              type: 'success'
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
    handleClick(row){
      console.log(row)
      this.$router.push({ path: `/promotion/modify?id=${row.id}` })
      return;
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

