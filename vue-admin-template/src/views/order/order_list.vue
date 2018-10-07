<template>
  <div class="app-container">
    <el-form ref="orderSearchForm" :rules="rules" :model="form" label-width="120px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="订单号" prop="orderId">
            <el-input v-model="form.orderId"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="商品ID" prop="productTaobaoId">
            <!-- <el-input v-model="form.productTaobaoNo" placeholder="输入商品名称查询"></el-input> -->
              <el-select
                v-model="form.productTaobaoId"
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

let statusTypes = {
 "0": '已创建',
 "1":"待支付",
//  "1":"待支付（促销判断通过）",
 "11":"已扫描",
 "2":"已支付",
 "3":"出货",
 "-30":"取消",
 "-20":"异常",
 "-10":"缺货",
 "10":"准备中",
 "20":"取货中",
 "30":"出货中",
 "40":"已取货"
 }
export default {
  name : 'orderlist',
  components: {tableWithPages},
  data() {
    return {
      form: {
        "orderId": "",
        "pageIndex": 1,
        "pageSize": 50,
        "productTaobaoId": "",
        "productTaobaoName": "",
        "status": -1
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
            columnName: 'id',
            label : '订单号',
            width : null,
          },
          {
            columnName: 'taobaoCode',
            label : '淘宝订单号',
            width : null,
          },
          {
            columnName: 'deviceTaobaoNo',
            label : '设备号',
            width : null,
          },
          {
            columnName: 'statusStr',
            label : '订单状态',
            width : null,
          },
          {
            columnName: 'totalPrice',
            label : '订单金额(元)',
            width : null,
          },
          {
            columnName: 'orderDate',
            label : '订单时间',
            width : null,
          },
        ],
      },
      options4 : [],
      totalOrders : 0,
    }
  },
  mounted(){
    // console.log(urls.ad_list);
    let that = this;
    let postData = 
        {
          "name": '',
          "pageIndex": 1,
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
        this.$refs['orderSearchForm'].validate((valid) => {
          if (valid) {
            this.$message('正在查询')
            this.form.pageIndex = 1;
            this.queryOrder();
            // this.getAd();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    queryOrder(){
      let that = this;
      let postData = JSON.parse(JSON.stringify(this.form))
      
      console.log(postData)
      // return;
      this.tableData.loading = true;

      axios.post(`${urls.order_list}`, postData)
        .then(function(res){
          that.tableData.loading = false;
          if(res.data && res.data!=null){
            that.tableData.data = res.data.data.map(x=>{
              x.statusStr = statusTypes[x.status];
              x.orderDate = parseTime(new Date(x.createAt),'{y}年{m}月{d}日');

              return x;
            });
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
      this.queryOrder();
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

