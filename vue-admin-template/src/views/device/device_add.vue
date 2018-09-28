<template>
  <div class="app-container">
    <el-form ref="deviceAddForm" :rules="rules" :model="form" label-width="120px">
      <el-row>
        注意1，请首先在ERP中，基础字典->仓库，添加设备，并勾选面膜机
        注意2，正常流程下，应该在售货机上做售货机添加的操作，本页面作为后备使用
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="设备淘宝编号" prop="deviceTaobaoNo">
            <el-input v-model="form.deviceTaobaoNo"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="淘宝门店号" prop="shopId">
            <el-input v-model="form.shopId"></el-input>
          </el-form-item>
        </el-col>
        
      </el-row>
      
      <!-- </el-form-item> -->
      
      <el-form-item>
        <el-button type="primary" @click="showSubmitForm">新建</el-button>
      </el-form-item>
    </el-form>
    <el-dialog title="添加售货机" :visible.sync="confirmFormVisible">
      <el-form ref="confirmForm" :model="confirmForm" :rules="confirmRules">
        <el-form-item label="请输入<确认添加>以确认添加售货机" label-width="300px" prop="name">
          <el-input v-model="confirmForm.name" autocomplete="off"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="confirmFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from '@/utils/ajax';
import urls from '@/config/urls';

import {parseTime} from '@/utils/index';

export default {
  data() {
    return {
      form: {
        "deviceTaobaoNo": null,  //设备淘宝编号
        "shopId": null, //淘宝门店号
      },
      confirmForm : {
        name : ''
      },
      rules:{
        // deviceTaobaoNo: [
        //     { required: true, message: '请选择机器ID', trigger: 'change' },
        // ],
        deviceTaobaoNo: [
            { required: true, message: '请输入淘宝设备编号', trigger: 'change' },
        ],
        shopId: [
            { required: true, message: '请输入淘宝门店号', trigger: 'change' },
        ],
        
      },
      confirmRules : {
        name: [
            { required: true, message: '请输入文字', trigger: 'change' },           
            { validator: this.checkConfirmForm, trigger: 'change' },

        ],
      },
      confirmFormVisible : false,
      
    }
  },
  mounted(){
    // console.log(urls.ad_list);
    
  },
  methods: {
    showSubmitForm(){
      let that = this;
      this.$refs['deviceAddForm'].validate((valid) => {
          if (valid) {
            that.confirmFormVisible = true;
          } else {
            console.log('error submit!!');
            return false;
          }
        });
    },
    onSubmit() {
        this.$refs['confirmForm'].validate((valid) => {
          if (valid) {
            this.$message('正在保存')
            this.addDevice();
            // this.getAd();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    addDevice(){
      let that = this;
      axios.get(`${urls.device_init}`, {
        params :{
          deviceTaobaoNo : this.form.deviceTaobaoNo,
          shopId : this.form.shopId,
        }
      })
        .then(function(res){
          console.log(res);
          if(res.data !== false){
            that.confirmFormVisible = false;
            that.$message({
              message: '添加设备成功，请到售货机页面查看!',
              type: 'success'
            })
          }else{
            that.$message({
              message: '创建设备失败，请联系管理员!',
              type: 'warning'
            })
          }
          
        })
        .catch(function(error){
          console.log(error)

        })
    },
    checkConfirmForm(rule, value, callback){
        // console.log(arguments);
        // debugger
        if(value != '确认添加'){
              callback(new Error('请输入正确的文字'));
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

