<template>
  <div class="app-container">
    <el-row>
      <el-button type="primary" @click="addUserFormVisible = true;">新增用户</el-button>
    </el-row>
    <tableWithPages :tableData="tableData" :totalOrders="totalUsers" :pageChanged="changePage" :buttons="buttons" :showButtons="true"></tableWithPages>
    <el-dialog title="新增用户"  :visible.sync="addUserFormVisible">
      <el-form ref="addUserForm" :model="addUserform" :rules="userRules">
        <el-form-item label="登录名" prop="userName">
          <el-input v-model="addUserform.userName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="登录密码" prop="password" >
          <el-input v-model="addUserform.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="展示名称"  prop="name">
          <el-input v-model="addUserform.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户角色"  prop="role">
          <el-select v-model="addUserform.role" placeholder="请选择角色">
            <el-option label="普通用户" value="1"></el-option>
            <el-option label="系统管理员" value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addUserFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserSubmit">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑用户"  :visible.sync="editUserFormVisible">
      <el-form ref="editUserForm" :model="editUserForm" :rules="userRules">
        <el-form-item label="用户ID" prop="id">
          {{editUserForm.id}}
        </el-form-item>
        <el-form-item label="登录名" prop="userName">
          {{editUserForm.userName}}
        </el-form-item>
        <el-form-item label="登录密码" prop="password" >
          <el-input v-model="editUserForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="展示名称"  prop="name">
          <el-input v-model="editUserForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户角色"  prop="role">
          <el-select v-model="editUserForm.role" placeholder="请选择角色">
            <el-option label="普通用户" value="1"></el-option>
            <el-option label="系统管理员" value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editUserFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from '@/utils/ajax';
import urls from '@/config/urls';
import tableWithPages from '@/components/table/tableWithPages.vue';
import { mapGetters } from 'vuex'

import {parseTime} from '@/utils/index';
let adTypes = {
  0 : '图片',
  1 : '链接',
}
export default {
    components: {tableWithPages},
  name: 'adminPage',
  data() {
    return {
      tableData : {
        data:[],
        loading: false,
        columns :[
          {
            columnName: 'id',
            label : '用户编号',
            width : null,
          },
          {
            columnName: 'userName',
            label : '用户名',
            width : null,
          },
          {
            columnName: 'name',
            label : '用户昵称',
            width : null,
          },
          {
            columnName: 'roleStr',
            label : '用户角色',
            width : null,
          },
          {
            columnName: 'createAtStr',
            label : '创建时间',
            width : null,
          },
        ],
      },
      roleTypes : {
        '1' : "普通用户",
        '2': "系统管理员"
      },
      totalUsers : 0,
      buttons :[
        {
          label : '修改',
          fn : this.showModifyUser
        }
      ],
      addUserFormVisible : false,
      addUserform : {
          "name": "",
          "operId": "",
          "password": "",
          "phone": "",
          "role": '1',
          "userName": ""
      },
      userRules:{
        userName: [
            { required: true, message: '请填写登录名', trigger: 'change' },
        ],
        name: [
            { required: true, message: '请填写展示名', trigger: 'change' },
        ],
        password: [
            { required: true, message: '请填写密码', trigger: 'change' },
        ],
      },
      editUserFormVisible : false,
      editUserForm : {
          id : '',
          "name": "",
          "operId": "",
          "password": "",
          "phone": "",
          "role": '1',
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
  beforeMount(){
    if(this.roles[0] == 2){
      this.$message('欢迎系统管理员')
    }else{
      this.$message('您没有权限')
      this.$router.push({path:'/'});
    }
  },
  mounted(){
    this.queryUser();
  },
  methods: {
    onSubmit() {
        this.$refs['adCreateForm'].validate((valid) => {
          if (valid) {
            this.$message('正在保存')
            this.createPromotion();
            // this.getAd();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    createPromotion(){
      let that = this;
      let postData = JSON.parse(JSON.stringify(this.form))
      postData.beginTime = parseTime(postData.beginTime,'{y}-{m}-{d}');
      postData.endTime =  parseTime(postData.endTime,'{y}-{m}-{d}');
      postData.item = [{
        deviceTaobaoNo : null,
        limitQuantity : this.pageLimitQuantity,
        productTaobaoNo : this.pageProductTaobaoNo,
        shopId : null,
      }]
      postData.code = new Date().getTime().toString()
      console.log(postData)
      // return;
      axios.post(`${urls.promotion_add}`, postData)
        .then(function(res){
          console.log(res);
          if(res.data !== false){
            that.$message({
              message: '创建促销成功，请到促销列表页面查看!',
              type: 'success'
            })
          }else{
            that.$message({
              message: '创建促销失败，请联系管理员!',
              type: 'warning'
            })
          }
          
        })
        .catch(function(error){
          console.log(error)

        })
    },
    queryUser(){
      let that = this;

      let postData = 
          {
            "pageIndex": 1,
            "pageSize": 50,
            "phone": "",
            "status": 0,
            "userName": ""
          };
      axios.post(`${urls.user_list}`, postData)
        .then(function(res){
          // console.log(res.data.data);
          that.tableData.data = res.data.data.map(x=>{
            x.roleStr = that.roleTypes[x.role.toString()];
            x.createAtStr = parseTime(new Date(x.createAt),'{y}年{m}月{d}日');

            return x;
          });
          that.totalUsers = res.data.totalCount ;  
          that.loading = false;
        }).catch(function(error){
          console.log(error);
          that.loading = false;
        })
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    },
    
    changePage(){

    },
    showModifyUser(index, tableData){
      let rowData = tableData[index];
      this.editUserForm = JSON.parse(JSON.stringify(rowData));
      this.editUserFormVisible = true;
      console.log(arguments)
    },
    addUserSubmit(){
      this.$refs['addUserForm'].validate((valid) => {
          if (valid) {
            this.$message('正在创建用户')
            this.addUser();
            // this.getAd();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
    },
    addUser(){
      let that = this;
      let postData = this.addUserform ;
      axios.post(urls.user_add,  postData)
        .then(function(res){
          if(res.data.data === true){
            that.queryUser();
            that.$message({
              message: '创建用户成功',
              type: 'success',
            });
            that.addUserFormVisible = false;
          }else{
            that.$message({
              message: '创建用户失败，请联系管理员',
              type: 'warning',
            })
          }
          
        })
        .catch(function(err){
          // that.$message({
          //   message: '创建用户失败，请联系管理员',
          //   type: 'warning',
          // })
          console.log(err);
        })
    },
    editUserSubmit(){
      this.$refs['editUserForm'].validate((valid) => {
          if (valid) {
            this.$message('正在更新用户')
            this.editUser();
            // this.getAd();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
    },
    editUser(){
      let that = this;
      let postData = this.editUserForm ;
      axios.post(urls.user_edit,  postData)
        .then(function(res){
          if(res.data.data === true){
            that.queryUser();
            that.$message({
              message: '更新用户成功',
              type: 'success',
            });
            that.editUserFormVisible = false;
          }else{
            that.$message({
              message: '更新用户失败，请联系管理员',
              type: 'warning',
            })
          }
          
        })
        .catch(function(err){
          // that.$message({
          //   message: '创建用户失败，请联系管理员',
          //   type: 'warning',
          // })
          console.log(err);
        })
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

