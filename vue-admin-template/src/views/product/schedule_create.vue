<template>
  <div class="app-container">
    <el-form ref="adCreateForm" :rules="rules" :model="form" label-width="120px">
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
                :loading="loading">
                <el-option
                  v-for="item in options4_computed"
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
          <el-form-item label="开始日期" prop="saleDateStart">
            <el-date-picker v-model="form.saleDateStart" type="date" placeholder="开始日期" style="width: 100%;"/>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="2" class="line">-</el-col> -->
        <el-col :span="8">
          <el-form-item label="结束日期" prop="saleDateEnd">
            <el-date-picker v-model="form.saleDateEnd" type="date" placeholder="结束日期" style="width: 100%;"/>
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
        deviceTaobaoNo: [],
        productTaobaoNo: [],
        saleDateStart: '',
        saleDateEnd: '',
      },
      fileList: [],
      machines : [],
      rules:{
        // deviceTaobaoNo: [
        //     { required: true, message: '请选择机器ID', trigger: 'change' },
        // ],
        saleDateStart: [
            { required: true, message: '请选择开始日期', trigger: 'change' },
            { validator: this.compareTime, trigger: 'change' }
        ],
        saleDateEnd: [
            { required: true, message: '请选择结束日期', trigger: 'change' },
            { validator: this.compareTime, trigger: 'change' }
        ],
        deviceTaobaoNo: [
            { required: true, message: '请选择售货机', trigger: 'change' },
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
      productFilterText : '',
    }
  },
  watch(){

  },
  computed:{
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
        // console.log(data);
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
            this.createProductSchedule();
            // this.getAd();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    createProductSchedule(){
      let that = this;
      let postData = JSON.parse(JSON.stringify(this.form))
      postData.saleDateStart = parseTime(postData.saleDateStart,'{y}-{m}-{d}');
      postData.saleDateEnd =  parseTime(postData.saleDateEnd,'{y}-{m}-{d}');
      // console.log(postData)
      // return;
      axios.post(`${urls.schedule_add}`, postData)
        .then(function(res){
          if(res.data !== false){
            that.$message({
              message : '创建排期成功，请到商品排期页面查看',
              type : 'success',
            });
          }else{
            that.$message({
              message : '创建排期失败',
              type : 'warning',
            });
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
    
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true;
        
        let postData = 
            {
              "name": query,
              "pageIndex": 0,
              "pageSize": 100,
              "productTaobaoNo": ""
            };
        let that = this;
        axios.post(`${urls.product_list}`, postData)
          .then(function(res){
            console.log(res.data.data);
            that.options4 = res.data.data;
            that.loading = false;
          }).catch(function(error){
            console.log(error);
            that.loading = false;
          })
      } else {
        this.options4 = [];
      }
    },
    compareTime(rule, value, callback){
      console.log(arguments);
      // debugger
      if(this.form.saleDateStart != null && this.form.saleDateStart != '' && this.form.saleDateEnd != null && this.form.saleDateEnd != ''
          && this.form.saleDateStart.getTime() > this.form.saleDateEnd.getTime()){
            callback(new Error('开始日期不能晚于结束日期'));
          }
      callback();
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

