<template>
  <div class="app-container">
    <el-form ref="product_form" :rules="rules" :model="form" label-width="120px">

      
      <el-form-item label="标签名称" prop="name">
        <el-col :span="10">
          <el-input v-model="form.tagName"></el-input>
        </el-col>
        <el-col :span="3">
           <el-form-item>
            <el-button type="primary" @click="onSubmit">查询</el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
           <el-form-item>
            <el-button type="success" @click="addTagForm">新建</el-button>
          </el-form-item>
        </el-col>
      </el-form-item>
      <!-- <el-form-item label="商品ID" prop="productTaobaoNo">
        <el-col :span="10">
          <el-input v-model="form.productTaobaoNo"></el-input>
        </el-col>
      </el-form-item> -->

      
    </el-form>
      <el-table
        :data="tagTableData"
        stripe
        style="width: 100%">
        <el-table-column
          prop="id"
          label="ID"
          width="150">
        </el-table-column>
        <el-table-column
          prop="tagName"
          label="标签名称"
          width="250"
          >
        </el-table-column>
        <el-table-column
          label="标签图片"
          >
          <template slot-scope="scope">
            <img :src="url_prefix  + '/'+  scope.row.tagPath">
          </template>
        </el-table-column>
        <el-table-column
          prop="tagPath"
          label="标签图片路径"
          >
        </el-table-column>
        
        <el-table-column
          fixed="right"
          label="操作"
          width="200">
          <template slot-scope="scope">
            <!-- <el-button @click="handleClick(scope.row)" type="mini"  size="small">编辑</el-button> -->
            <!-- <el-button type="text" size="small">编辑</el-button> -->
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="新建标签" :visible.sync="dialogFormVisible">
        <el-form :model="add_form">
          <el-form-item label="标签名称" label-width="80px">
            <el-input v-model="add_form.tagName" autocomplete="off"></el-input>
          </el-form-item>
          <el-row>
            <el-col :span="12">
          <el-form-item label="标签图片" label-width="80px">
            <!-- <el-input v-model="add_form.tagPath" autocomplete="off"></el-input> -->
            <el-upload
              class="avatar-uploader"
              action="/apiback/common/upload"
              :show-file-list="false"
              :headers="headers"
              :on-success="handleAvatarSuccess"
              :on-preview="handlePreview"
              :before-upload="beforeAvatarUpload">
              <!-- <el-button size="small" type="primary">点击上传</el-button> -->

              <img v-if="add_form.tagPath != null && add_form.tagPath != ''" :src="url_prefix  + '/'+  add_form.tagPath" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              
              
          </el-upload>
          </el-form-item>
            </el-col>
            <el-col :span="12">
              尺寸建议 117*60，JPG或PNG图片
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addTag">确 定</el-button>
        </div>
      </el-dialog>

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
        "tagName": "",
        "pageIndex": 0,
        "pageSize": 100,
      },
      add_form : {
        "tagName" : "",
        "tagPath" : "",
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
      tagTableData : [],
      dialogFormVisible :false,
      url_prefix : urls.url_prefix,
    }
  },
  mounted(){
    // console.log(urls.ad_list);
  },
  computed:{
    headers(){
      return {token : this.$store.state.user.token};
    }
  },
  methods: {
    onSubmit() {
      this.$refs['product_form'].validate((valid) => {
          if (valid) {
            this.$message('查询中')
            this.getTags();
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
    getTags(){
      let that = this;
      let postData = this.form;
      axios.post(`${urls.tag_list}`,postData)
      // axios.post(`http://139.224.54.234:8082/product/list`,postData)

        .then(function(res){
          that.tagTableData = res.data.data.map(x=>{

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
    },
    addTagForm(){
      this.add_form = {
        "tagName" : "",
        "tagPath" : "",
      };
      this.dialogFormVisible = true;
    },
    addTag(){
      let that = this;
      let postData = this.add_form;
      axios.post(`${urls.tag_add}`,postData)
      .then(res=>{
        this.$message.success("新建成功");
        this.dialogFormVisible = false;
        this.getTags();
      })
      .catch(err=>{
        console.log(err);
        this.$message.warn("新建失败");
      })
    },
    handlePreview(file) {
        console.log(file);
        window.open(`${file.url}`);
      },
    handleAvatarSuccess(res, file) {
        // this.form.cover = URL.createObjectURL(file.raw);
        // this.$set(this.form, 'cover', urls.url_prefix + '/' + res.data)
        this.$set(this.add_form, 'tagPath',  res.data)
      },
    beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isPNG = file.type === 'image/png';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG && !isPNG) {
          this.$message.error('上传图片只能是 JPG ,PNG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传图片大小不能超过 2MB!');
        }
        return (isJPG || isPNG) && isLt2M;
      },
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

