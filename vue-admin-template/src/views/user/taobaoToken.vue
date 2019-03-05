<template>
  <div class="app-container">
    <el-form ref="taobaoTokenForm" :model="form" label-width="100px">
      <el-form-item label="注意事项">
        <span style="color:red;">该操作将影响所有系统与淘宝之间的数据交互，请确认数据无误后，再点击确认</span>
      </el-form-item>
      <el-form-item label="当前session">
        <span >{{current_taobaoToken}}</span>
      </el-form-item>
      <el-form-item label="新Session">
        <el-input v-model="form.taobaoToken"></el-input>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存</el-button>
        <!-- <el-button>取消</el-button> -->
      </el-form-item>
      <el-form-item label="如何获取">
        <span >请在浏览器新窗口打开这个链接</span><br>
        <span >http://open.taobao.com/apitools/sessionPage.htm?spm=a219a.7386653.0.0.fDGAAZ</span><br>
        <span> 使用&lt;膜法世家天猫旗舰店&gt;账号登录并授权</span><br>
        <span> 您将看到 session 和 refreshtoken 两行数据</span><br>
        <span> 请复制 session 内容到上面的文本框中并点击保存</span><br>
        <span> session的内容应该类似这个样子，由数字和字母组成，不含符号和中文:  6101708b1f002b851b49abbb401cb75ae7e4229b6f12109368609005  </span>



      </el-form-item>
      
      
    </el-form>

  </div>
</template>

<script>
import axios from '@/utils/ajax';
import urls from '@/config/urls';
import getQueryString from '@/utils/getQueryString';

var qs = require('qs');

import {parseTime} from '@/utils/index';
let adTypes = {
  0 : '图片',
  1 : '链接',
}
export default {
  data() {
    return {
      form :{
        name : ""
      },
      current_taobaoToken : "",
    }
  },
  mounted(){
    this.getTaobaoToken();
  },
  methods: {
    onSubmit() {
        this.$refs['taobaoTokenForm'].validate((valid) => {
          if (valid) {
            this.$message('正在保存')
            this.modifyTaobaoToken();
            // this.getAd();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    modifyTaobaoToken(){
      let that = this;
      let postData = {
          "operId": "",
          "sysKey": "token",
          "sysValue": this.form.taobaoToken
        }
      console.log(postData)
      axios.post(`${urls.sys_dict_upload}`, postData)
        .then(function(res){
          console.log(res);
          if(res.data !== false){
            that.$message({
              message: '保存session成功!',
              type: 'success'
            })
          }else{
            that.$message({
              message: '保存session成功，请联系管理员!',
              type: 'warning'
            })
            
          }
          that.getTaobaoToken();
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
    getTaobaoToken(){
      let postData = {

      }
      let that = this;
      axios({
        method:"post",
        url: urls.sys_dict_detail,
        headers:{
            'Content-type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify({
            sysKey: "token",
        }) ,
        // transformRequest: [function (data) {
        //   let QS = require("qa")
        //     let ret = ''

        //     let arr = [];
        //     for (let it in data) {
        //       arr.push(encodeURIComponent(it) + '=' + encodeURIComponent(data[it]));
        //     }
        //     ret = arr.join("&");
        //     return ret;
        //   }],
      }).then(res=>{
        console.log(res.data);
        that.current_taobaoToken = res.data;
      })
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

