<template>
  <div class="app-container">
    <el-form ref="product_form" :rules="rules" :model="form" label-width="120px">

      
      <el-form-item label="商品名称" prop="name">
        <el-col :span="10">
          <el-input v-model="form.name"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="商品ID" prop="productTaobaoNo">
        <el-col :span="10">
          <el-input v-model="form.productTaobaoNo"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
      <el-table
        :data="productTableData"
        stripe
        style="width: 100%">
        <el-table-column
          prop="productTaobaoNo"
          label="ID"
          width="150">
        </el-table-column>
        <el-table-column
          prop="name"
          label="商品名称"
          >
        </el-table-column>
        <el-table-column
          prop="specifications"
          label="商品规格"
          width="150">
        </el-table-column>
        <el-table-column
          prop="price"
          label="进价"
          width="120">
        </el-table-column>
        <el-table-column
          prop="salePrice"
          label="售价"
          width="120">
        </el-table-column>
        <el-table-column
          prop="unit"
          label="销售单位"
          width="120">
        </el-table-column>
        <el-table-column
          prop="hotStr"
          label="热销"
          width="120">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="100">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">编辑</el-button>
            <!-- <el-button type="text" size="small">编辑</el-button> -->
          </template>
        </el-table-column>
      </el-table>
  </div>
</template>

<script>

// import axios from 'axios'
import axios from '@/utils/ajax';
import urls from '@/config/urls';

import {parseTime} from '@/utils/index';

let adTypes = {
  0 : '图片',
  1 : '链接',
}
let adStatus = {
  1 : '上线',
  2 : '下线',
}

export default {
  data() {
    return {
      form: {
        "name": "",
        "pageIndex": 0,
        "pageSize": 100,
        "productTaobaoNo": ""
      },
      
      rules:{
        // deviceTaobaoNo : [
        //     { required: true, message: '请选择机器ID', trigger: 'change' },
            
        //   ],
        // startDate : [
        //     { required: true, message: '请选择日期', trigger: 'change' },
            
        //   ],
          // name: [
          //   { required: true, message: '请输入活动名称', trigger: 'change' },
          //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
          // ],
      },
      machines : [],
      // machines : [{
      //   name : '售货机一号',id:"1"
      // },{
      //   name : '售货机老大',id:"2"
      // }],
      productTableData : [],
    }
  },
  mounted(){
    // console.log(urls.ad_list);
  },
  methods: {
    onSubmit() {
      this.$refs['product_form'].validate((valid) => {
          if (valid) {
            this.$message('查询中')
            this.getProducts();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    },
    getProducts(){
      let that = this;
      let postData = this.form;
      axios.post(`${urls.product_list}`,postData)
      // axios.post(`http://139.224.54.234:8082/product/list`,postData)

        .then(function(res){
          that.productTableData = res.data.data.map(x=>{

            x.hotStr = x.hot ? '是': '否';
            return x;
          });
          // console.log(res.data.data)
        })
        .catch(function(error){
          console.log(error)
        })
    },
    handleClick(row){
      this.$router.push({ path: `/product/modify?id=${row.id}` })
      return;
      console.log(arguments)
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

