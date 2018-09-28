<template>
  <div class="app-container">
      <productForm ref="productForm" :product_form="form" :product_images="fileList"/>
      <el-row>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </el-row>
  </div>
</template>

<script>
import axios from '@/utils/ajax';
import urls from '@/config/urls';
import getQueryString from '@/utils/getQueryString';
import product from '@/components/product'

import {parseTime} from '@/utils/index';

export default {
  components: {
    productForm : product
  },
  data() {
    return {
      item_sys_id : null,
      form: {
        "content": "",
        "hot": false,
  
        "name": "",
        "operId": "",
        "price": 0,
        "productTaobaoNo": "",
        "salePrice": 0,
        "score": 0,
        "specifications": "",
        "unit": ""
      },
      fileList: [
        // {
        //   name: 'food.jpeg', 
        //   url: urls.url_prefix + '/upload/22cfb4bd569f424ead90712728ebbf3d.jpg'
        // }, 
        // {
        //   name: 'food2.jpeg', 
        //   url: urls.url_prefix + '/upload/068b700701214d97b35e159abcf07899.jpg'
        // }
        ],
      
      rules:{
        // deviceTaobaoNo: [
        //     { required: true, message: '请选择机器ID', trigger: 'change' },
        // ],
        // startTime: [
        //     { required: true, message: '请选择开始日期', trigger: 'change' },
        // ],
        // endTime: [
        //     { required: true, message: '请选择结束日期', trigger: 'change' },
        // ],
        // type: [
        //     { required: true, message: '请选择广告类型', trigger: 'change' },
        // ],
        // image: [
        //     { required: true, message: '请上传', trigger: 'change' },
        // ],
          // name: [
          //   { required: true, message: '请输入活动名称', trigger: 'change' },
          //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
          // ],
        salePrice: [
            {type: 'number', message: '价格必须是数字', trigger: 'change' },
            { validator: this.checkPrice, trigger: 'change' },

            //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
        ],
      },
    }
  },
  computed:{
    headers(){
      return {token : this.$store.state.user.token};
    }
  },
  mounted(){
    // console.log(urls.ad_list);
    // let item_sys_id = getQueryString('id');
    // // console.log('itemsysid',item_sys_id)
    // if(item_sys_id == null){
    //   this.$router.push({path:'/product/index'});
    //   return;
    // }
    // this.item_sys_id = item_sys_id;
    // let that = this;
    // axios.get(`${urls.product_detail}${item_sys_id}`)
    //   .then(function(data){
    //     console.log(data);
    //     // that.form = data.data;
    //     that.$set(that, 'form' , data.data);
    //     if(data.data.images == '' || data.data.images == null){
    //       that.fileList = [];
    //     }else{
    //       that.fileList = data.data.images.split(',').map(function(x, index){
    //         // console.log(arguments)
    //         return {
    //           url : urls.url_prefix + '/' + x,
    //           real_url : x,
    //           name : `图片${index+1}`,
    //         }
    //       })
    //     }
        
    //   })
  },
  methods: {
    onSubmit() {
        let that = this;
        this.$refs['productForm'].getForm()
          .then(function({form,fileList}){
            console.log(form, fileList)
            that.addProduct(form, fileList);
          });
      // this.$message('submit!')
    },
    addProduct(form, fileList){
      let that = this;
      let postData = {
        ...form,
        images: fileList.map(x=>x.real_url),
        id : this.item_sys_id,
      }
      axios.post(`${urls.product_add}`, postData)
        .then(function(res){
          console.log(res.data.data);
          if(res.data !== false){
            that.$message({
              message : '新增商品成功，请到商品列表查看',
              type : 'success',
            });
          }else{
            that.$message({
              message : '新增商品失败',
              type : 'warning',
            });
          }
        })
        .catch(function(error){
          console.log(error)
        })
    },
    
      checkPrice(rule, value, callback){
        // console.log(arguments);
        // debugger
        if(value <= 0){
              callback(new Error('价格必须大于0'));
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
</style>

