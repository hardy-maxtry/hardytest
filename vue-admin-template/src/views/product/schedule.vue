<template>
  <div class="app-container">
    <el-form ref="productScheduleListForm" :rules="rules" :model="form" label-width="120px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="售货机" prop="deviceTaobaoNo">
            <el-select v-model="form.deviceTaobaoNo" multiple placeholder="请选择售货机">
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
                :filter-method="filterProduct"

                multiple
                placeholder="输入商品名称"
                :loading="loading"
                >
                <el-option
                  v-for="item in options4_computed"
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
      </el-row>
      <el-row>
      <!-- <el-form-item label="生效期" > -->
        <el-col :span="8">
          <el-form-item label="开始日期" prop="schedulingSaleStartDate">
            <el-date-picker v-model="form.schedulingSaleStartDate" type="date" placeholder="开始日期" style="width: 100%;"/>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="2" class="line">-</el-col> -->
        <el-col :span="8">
          <el-form-item label="结束日期" prop="schedulingSaleEndDate">
            <el-date-picker v-model="form.schedulingSaleEndDate" type="date" placeholder="结束日期" style="width: 100%;"/>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- </el-form-item> -->
      <el-form-item label="审核状态" prop="schedulingStatus">
        <el-col :span="4">
          <el-select v-model="form.schedulingStatus" placeholder="请选择审核状态">
            <el-option label="不限" value="0"></el-option>
            <el-option label="待审核" value="1"></el-option>
            <el-option label="审核通过" value="2"></el-option>
            <el-option label="审核不通过" value="3"></el-option>
          </el-select>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
    <div v-if="showApproveToolbar">
      <!-- <el-row>以下是商品: <span style="font-weight: bold;text-decoration: underline;">{{selectedProductID}} : {{selectedProductName}} </span>的排期情况</el-row> -->
      <el-row>
        <el-button type="success" size="small" @click="approveSuccess">批量审核通过</el-button>
        <el-button type="danger" size="small" @click="approveFailed">批量审核不通过</el-button>
        <!-- <span>以下是商品: <span style="font-weight: bold;text-decoration: underline;">{{selectedProductID}} : {{selectedProductName}} </span>的排期情况</span> -->
      </el-row>
    </div>
      <!-- <el-row>位于门店: <span style="font-weight: bold;text-decoration: underline;">{{selectedProductID}}:{{selectedProductName}} </span>的排期情况</el-row> -->
      <el-table
        :data="productScheduleTableData"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55"/>
        <!-- <el-table-column
          prop="productTaobaoNo"
          label="ID"
          width="150">
        </el-table-column>
        <el-table-column
          prop="name"
          label="商品名称"
          >
        </el-table-column> -->
        <el-table-column
          prop="shopId"
          label="店铺ID"
         width="100" 
         sortable>
        </el-table-column>
        <el-table-column
          prop="shopName"
          label="店铺名称"
          >
        </el-table-column>
        <el-table-column
          prop="productTaobaoNo"
          label="商品ID"
          sortable
        >
        </el-table-column>
        <el-table-column
          prop="productName"
          label="商品名称"
        >
        </el-table-column>
        <el-table-column
          prop="stock"
          label="当前库存"
          >
        </el-table-column>
        <el-table-column
          prop="deviceTaobaoNo"
          label="设备号"
          sortable
          >
        </el-table-column>
        <el-table-column
          prop="deviceShowName"
          label="设备展示名称"
          >
        </el-table-column>
        <el-table-column
          prop="saleDateStr"
          label="销售日期"
          sortable
          >
        </el-table-column>
        <el-table-column
          prop="statusStr"
          label="审核状态"
          sortable
          >
          <template slot-scope="scope">
            <span v-if="scope.row.status==2" style="color:#5baf5b;">{{ scope.row.statusStr }}</span>
            <span v-else-if="scope.row.status==3" style="color:#f78989;">{{ scope.row.statusStr }}</span>
            <span v-else>{{ scope.row.statusStr }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          fixed="right"
          label="操作"
          width="100">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">编辑</el-button>
          </template>
        </el-table-column> -->
      </el-table>
    
  </div>
</template>

<script>
import axios from '@/utils/ajax';
import urls from '@/config/urls';

import {parseTime} from '@/utils/index';
let statusTypes = {
  1 : '待审核',
  2 : '审核通过',
  3 : '审核不通过'
}
export default {
  data() {
    return {
      form: {
        "deviceTaobaoNo": [],
        "pageIndex": 0,
        "pageSize": 100,
        "productTaobaoNo": [],
        schedulingSaleEndDate: new Date(new Date().getTime()+7*24*3600*1000),
        schedulingSaleStartDate: new Date(new Date().getTime()-7*24*3600*1000),
        "schedulingStatus": '0'
      },
      fileList: [],
      machines : [],
      productScheduleTableData : [],
      rules:{
        productTaobaoNo: [
            { required: true, message: '请选择商品', trigger: 'change' },
        ],
        schedulingSaleStartDate: [
            { required: true, message: '请选择开始日期', trigger: 'change' },
            { validator: this.compareTime, trigger: 'change' }
        ],
        schedulingSaleEndDate: [
            { required: true, message: '请选择结束日期', trigger: 'change' },
            { validator: this.compareTime, trigger: 'change' }
        ],
        deviceTaobaoNo: [
            { required: true, message: '请选择售货机', trigger: 'change' },
        ],
        // productTaobaoNo: [
        //     { required: true, message: '请上传', trigger: 'change' },
        // ],
          // name: [
          //   { required: true, message: '请输入活动名称', trigger: 'change' },
          //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
          // ],
      },
      options4: [],
      loading : false,
      selectedProductName:'',
      selectedProductID : '',
      scheduleMultipleSelection: [],
      productFilterText : ''
    }
  },
  computed:{
    showApproveToolbar(){
      return this.productScheduleTableData != null && Array.isArray(this.productScheduleTableData) && this.productScheduleTableData.length > 0;
    },
    options4_computed(){
      if(this.productFilterText == ''){
        return this.options4;
      }else{
        return this.options4.filter(x=>{
          return x.productTaobaoNo.toString().indexOf(this.productFilterText) >= 0 || x.name.indexOf(this.productFilterText) >= 0
        })
      }
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
        let that = this;
        this.$refs['productScheduleListForm'].validate((valid) => {
          if (valid) {
            
            this.options4.filter(x=>{
              return x.productTaobaoNo == that.form.productTaobaoNo;
            }).forEach(x=>{
              that.selectedProductName = x.name;
              that.selectedProductID = x.productTaobaoNo;
            })
            this.$message('正在查询')
            this.searchProductSchedule();
            // this.getAd();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    searchProductSchedule(){
      let that = this;
      let postData = {
        ...this.form,
      }
      axios.post(`${urls.schedule_list}`, postData)
        .then(function(res){
          that.productScheduleTableData = res.data.data;
          that.productScheduleTableData.forEach(x=>{
            that.$set(x, 'saleDateStr',parseTime(new Date(x.saleDate),'{y}年{m}月{d}日'))
            that.$set(x, 'statusStr',statusTypes[x.status])
          })
          that.scheduleMultipleSelection = [];
          that.$message({
            type : "success",
            message : "查询完成"
          });
          // console.log(res.data.data)
        })
        .catch(function(error){
          console.log(error)
          that.$message({
            type : "waning",
            message : "查询异常，请联系管理员"
          });
        })
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    },
    compareTime(rule, value, callback){
      console.log(arguments);
      // debugger
      if(this.form.schedulingSaleStartDate != null && this.form.schedulingSaleStartDate != '' && this.form.schedulingSaleEndDate != null && this.form.schedulingSaleEndDate != ''
          && this.form.schedulingSaleStartDate.getTime() > this.form.schedulingSaleEndDate.getTime()){
            callback(new Error('开始日期不能晚于结束日期'));
          }
      callback();
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
    //         // console.log(res.data.data);
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
    // handleClick(row){

    // }
    handleSelectionChange(val) {
      this.scheduleMultipleSelection = val;
    },
    approveSuccess(){
      let ids = this.scheduleMultipleSelection.map(x=>{
        return x.id;
      });
      if(ids.length == 0){
        this.$message({
          message: "请选择需要审批的行",
          type : "warning"
        });
        return;
      }
      let putData = {
        ids : ids,
        status: 2
      };
      let that = this;
      axios.put(urls.schedule_update_status, putData).then(function(res){
        console.log(res.data.data);
        that.productScheduleTableData.forEach(x=>{
          if(ids.indexOf(x.id)>=0){
            that.$set(x, 'status',2)
            that.$set(x, 'statusStr',statusTypes[x.status])
          }
          that.$message({
            type : "success",
            message : "操作成功"
          });
        });
      })
    },
    approveFailed(){
      let ids = this.scheduleMultipleSelection.map(x=>{
        return x.id;
      });
      if(ids.length == 0){
        this.$message({
          message: "请选择需要审批的行",
          type : "warning"
        });
        return;
      }
      let putData = {
        ids : ids,
        status: 3
      };
      let that = this;
      axios.put(urls.schedule_update_status, putData).then(function(res){
        that.productScheduleTableData.forEach(x=>{
          if(ids.indexOf(x.id)>=0){
            that.$set(x, 'status',3)
            that.$set(x, 'statusStr',statusTypes[x.status])
          }
          that.$message({
            type : "success",
            message : "操作成功"
          });
        });
      })
    },
    filterProduct(val){
      // console.log(arguments);
      this.productFilterText = val
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

