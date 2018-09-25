<template>
  <div class="app-container">
    <el-form ref="adCreateForm" :rules="rules" :model="form" label-width="120px" label-position="left">
      <el-row>
        <el-col :span="8">
          <el-form-item label="商品ID" prop="productTaobaoNo">
            {{form.productTaobaoNo}}
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品名称" prop="id">
            {{form.name}}
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否热销" prop="hot">
            <el-switch
              v-model="form.hot"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否">
            </el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      
      
      <el-row>
        <el-col :span="8">
          <el-form-item label="商品规格" prop="specifications">
            {{form.specifications}}
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="销售单位" prop="unit">
            {{form.unit}}
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="商品成本（元）" prop="price">
            {{form.price}}
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品售价（元）" prop="salePrice">
            <el-input-number v-model="form.salePrice" :precision="2" :step="1" ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- </el-form-item> -->
      <el-form-item label="商品图片">
        <el-col :span="4">
          <el-upload
            class="upload-demo"
            action="/apiback/common/upload"
            :on-success="handleUploadSuccess"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            :before-upload="beforeProductImageUpload"
            list-type="picture"
            :headers="headers"
            multiple
            :limit="3"
            :on-exceed="handleExceed"
            :file-list="fileList">
            <el-button size="small" type="primary">点击上传</el-button>
            <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
          </el-upload>
        </el-col>
        <!-- <el-col :span="11">
          <el-input :disabled="true" v-model="fileList.map(x=>x.url).toString()"></el-input>
        </el-col> -->
      </el-form-item>
      <el-form-item label="商品描述" prop="content">
        <el-input 
          type="textarea"
          :rows="2" 
          v-model="form.content">
        </el-input>
      </el-form-item>
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

export default {
  data() {
    return {
      item_sys_id : null,
      form: {
        deviceTaobaoNo: '',
        title: '',
        startTime: '',
        endTime: '',
        image: '',
        type: '1',
        url: '',
        desc: ''
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
    let item_sys_id = getQueryString('id');
    // console.log('itemsysid',item_sys_id)
    if(item_sys_id == null){
      this.$router.push({path:'/product/index'});
      return;
    }
    this.item_sys_id = item_sys_id;
    let that = this;
    axios.get(`${urls.product_detail}${item_sys_id}`)
      .then(function(data){
        console.log(data);
        that.form = data.data;
        if(data.data.images == '' || data.data.images == null){
          that.fileList = [];
        }else{
          that.fileList = data.data.images.split(',').map(function(x, index){
            console.log(arguments)
            return {
              url : urls.url_prefix + '/' + x,
              real_url : x,
              name : `图片${index+1}`,
            }
          })
        }
        
      })
  },
  methods: {
    onSubmit() {
        console.log(this.fileList);
        this.$refs['adCreateForm'].validate((valid) => {
          if (valid) {
            this.$message('正在保存')
            // this.createAd();
            this.modifyProduct();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    modifyProduct(){
      let that = this;
      let postData = {
        ...this.form,
        images: this.fileList.map(x=>x.real_url),
        id : this.item_sys_id,
      }
      axios.post(`${urls.product_edit}`, postData)
        .then(function(res){
          console.log(res.data.data);
          if(res.data !== false){
            that.$message({
              message : '更新商品成功',
              type : 'success',
            });
          }else{
            that.$message({
              message : '更新商品失败',
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
      handleRemove(file, fileList) {
        console.log(file, fileList);
        for(let x = 0; x < this.fileList.length; x++){
          let tmp_img = this.fileList[x];
          if(tmp_img.url == file.url && tmp_img.uid == file.uid){
            this.fileList.splice(x, 1);
            break;
          }
        }
      },
      handlePreview(file) {
        console.log(file);
        window.open(`${file.url}`);
      },
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },
      beforeRemove(file, fileList) {
        console.log(fileList)
        return this.$confirm(`确定移除 ${ file.name }？`).then(function(){
          console.log(fileList)
        })
      },
      handleUploadSuccess(response, file, fileList){
        // this.form.image = response.data;
        console.log(arguments)
        this.fileList.push({
          name : file.name,
          url : urls.url_prefix  + '/'+ file.response.data,
          real_url : file.response.data
        })
      },
      beforeProductImageUpload(file){
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
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

