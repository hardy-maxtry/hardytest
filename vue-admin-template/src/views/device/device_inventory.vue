<template>
  <div class="app-container">
    <el-form ref="inventorySearchForm" :rules="rules" :model="form" label-width="120px">

      <el-row>
        <el-col :span="8">
          <el-form-item label="售货机" prop="deviceTaobaoNo">
            <el-select v-model="form.deviceTaobaoNo" clearable placeholder="请选择售货机">
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
                clearable
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
      
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
    <tableWithPages :tableData="tableData" :totalOrders="totalOrders" :pageChanged="changePage"></tableWithPages>
  </div>
</template>

<script>
import axios from '@/utils/ajax';
import urls from '@/config/urls';
import tableWithPages from '@/components/table/tableWithPages.vue';

import {parseTime} from '@/utils/index';

export default {
  name : 'orderlist',
  components: {tableWithPages},
  data() {
    
    return {
      form: {
        "pageIndex": 1,
        "pageSize": 50,
        "productTaobaoNo": "",
        "deviceTaobaoNo": '',
      },
      rules:{
        // deviceTaobaoNo: [
        //     { required: true, message: '请选择机器ID', trigger: 'change' },
        // ],

        // name: [
        //     { required: true, message: '请填写活动名称', trigger: 'change' },
        //     //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
        // ],
        
          // name: [
          //   { required: true, message: '请输入活动名称', trigger: 'change' },
          //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
          // ],
      },
      nameRules : {
        name: [
            { required: true, message: '请填写别名', trigger: 'blur' },
        ],
      },
      loading: false,
      pageProductTaobaoNo : '',
      pageLimitQuantity : 1,
      dialogFormVisible : false,
      nameForm : {
        name : '',
      },
      tableData: {
        data:[],
        loading: false,
        columns :[
          // {
          //   columnName: 'createAt',
          //   label : '订单时间',
          //   width : null,
          // },
          // {
          //   columnName: 'createAt',
          //   label : '订单时间',
          //   width : null,
          // },
          {
            columnName: 'deviceTaobaoNo',
            label : '淘宝设备ID',
            width : null,
          },
          {
            columnName: 'deviceName',
            label : '设备名称',
            width : null,
          },
          {
            columnName: 'productTaobaoNo',
            label : '淘宝商品ID',
            width : null,
          },
          {
            columnName: 'productName',
            label : '商品名称',
            width : 400,
          },
          {
            columnName: 'stock',
            label : '当前库存',
            width : null,
          },

        ],
      },
      options4 : [],
      totalOrders : 0,
      productFilterText :"",
      machines : [],
    }
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
        this.$refs['inventorySearchForm'].validate((valid) => {
          if (valid) {
            this.$message('正在查询')
            this.form.pageIndex = 1;
            this.queryInventory();
            // this.getAd();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    queryInventory(){
      let that = this;
      let postData = JSON.parse(JSON.stringify(this.form))
      
      console.log(postData)
      // return;
      this.tableData.loading = true;

      axios.post(`${urls.inventory_list}`, postData)
        .then(function(res){
          that.tableData.loading = false;
          if(res.data && res.data!=null){
            that.tableData.data = res.data.data;
            that.totalOrders = res.data.totalCount ;  

            that.$message({
              message: '查询成功!',
              type: 'success'
            })
          }else if(res.data == null){
            that.tableData.data = [];
            that.totalOrders = 0;
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
          that.tableData.loading = false;
          console.log(error)

        })
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    },
    changePage(val){
      this.form.pageIndex = val;
      this.queryInventory();
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

