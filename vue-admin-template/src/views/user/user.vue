<template>
  <div class="app-container">
    <el-row>
      <el-col :span="8">
        <span>用户名：{{name}}</span>
      </el-col>
      <el-col :span="8">
        <span>角色:<span v-for="role in roles" :key="role">{{ roleTypes[role] }}</span></span>
      </el-col>
    </el-row>
    <br>
    <!-- <el-row> -->
      <el-form ref="changePasswordForm"  :rules="rules" :model="form" label-width="120px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="form.oldPassword" type="password"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="输入新密码" prop="newPassword">
              <el-input v-model="form.newPassword" type="password"></el-input>
            </el-form-item>
          </el-col>
        </el-row>        
        <el-row>
          <el-col :span="8">
            <el-form-item label="再次输入新密码" prop="comfirmPassword">
              <el-input v-model="form.comfirmPassword" type="password"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <el-button type="primary" @click="onSubmit">修改密码</el-button>
        </el-form-item>
      </el-form>
    <!-- </el-row> -->
  </div>
</template>

<script>
import axios from '@/utils/ajax';
import urls from '@/config/urls';
import { mapGetters } from 'vuex'

import {parseTime} from '@/utils/index';

export default {
  data() {
    return {
      roleTypes : {
        '1' : "普通用户",
        '2': "系统管理员"
      },
      form :{
        id : this.id,
        oldPassword : '',
        newPassword : '',
        comfirmPassword: '',
      },
      totalUsers : 0,
      rules:{
        comfirmPassword: [
            { required: true, message: '请再次填写新密码', trigger: 'change' },
           
        ],
        newPassword: [
            { required: true, message: '请选择新密码', trigger: 'change' },
            
        ],
        oldPassword: [
            { required: true, message: '请选择原密码', trigger: 'change' },
            
        ],
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'roles',
      'id'
    ])
  },
  mounted(){
    
  },
  methods: {
    onSubmit() {
        this.$refs['changePasswordForm'].validate((valid) => {
          if (valid) {
            this.$message('正在查询')
            if(this.form.newPassword == this.form.comfirmPassword){
              this.changePassword();
            }else{
              this.$message({
                type :"warning",
                message: "新密码输入不一致",
              })
            }
            
            // this.getAd();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    
    changePassword(){
      let postData = this.form;
      postData.id = this.id;
      let that = this;
      console.log(postData)
      // return 
      axios.post(urls.user_updatepassword2, postData)
        .then(function(data){
          if(data.data){
            that.$message({
              message : '密码更新成功',
              type: "success" 
            })
          }else{
            that.$message({
              message : '密码更新失败，请联系管理员',
              type: "warning" 
            })
          }
        });
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

