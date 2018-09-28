<template>
  <div class="app-container">
    <el-form ref="deviceSearchForm" :rules="rules" :model="form" label-width="120px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="淘宝设备编号" prop="deviceTaobaoNo">
            <el-input v-model="form.deviceTaobaoNo"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="设备名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
<el-table
        :data="deviceListTableData"
        stripe
        style="width: 100%"
        >
        <!-- <el-table-column
          type="selection"
          width="55"/> -->
        <el-table-column
          prop="deviceTaobaoNo"
          label="淘宝设备编号"
          width="130">
        </el-table-column>
        <el-table-column
          prop="deviceErpNo"
          label="ERP设备序列号"
          width="130">
        </el-table-column>
        <el-table-column
          prop="name"
          label="ERP设备名称"
          >
        </el-table-column>
        <el-table-column
          prop="showName"
          label="设备别名"
          >
        </el-table-column>
        
        <el-table-column
          prop="shopId"
          label="门店编号"
          >
        </el-table-column>
        <el-table-column
          prop="shopName"
          label="门店名称"
          >
        </el-table-column>
        <el-table-column
          prop="address"
          label="地址"
          >
        </el-table-column>
        <el-table-column
          prop="statusStr"
          label="设备状态"
          >
          <template slot-scope="scope">
            <span v-if="scope.row.status==1" style="color:#5baf5b;">{{ scope.row.statusStr }}</span>
            <span v-else-if="scope.row.status==0" style="color:#f78989;">{{ scope.row.statusStr }}</span>
            <span v-else>{{ scope.row.statusStr }}</span>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="300">
          <template slot-scope="scope">
            <el-button @click="editDeviceForm(scope.row)" type="info" size="mini">编辑别名</el-button>
            <el-button @click="changeDeviceStatus(scope.row)" type="success" size="mini" :disabled="scope.row.status == 1">上线</el-button>
            <el-button @click="changeDeviceStatus(scope.row)" type="danger" size="mini" :disabled="scope.row.status == 0">下线</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog title="编辑设备别名" :visible.sync="dialogFormVisible">
        <el-form ref="nameEditForm" :model="nameForm" :rules="nameRules" >
          <el-form-item label="设备别名"  prop="name">
            <el-input v-model="nameForm.name"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDevice">确 定</el-button>
        </div>
      </el-dialog>
  </div>
</template>

<script>
import axios from '@/utils/ajax';
import urls from '@/config/urls';

import {parseTime} from '@/utils/index';

let statusTypes = {
  0 : '下线',
  1 : '上线',
}
export default {
  data() {
    return {
      form: {
        "deviceTaobaoNo": "", //开始时间,Date
        "name": "",//结束时间,Date
        "pageIndex": 1,
        "pageSize": 100,

      },
      deviceListTableData: [],

      rules:{
        // deviceTaobaoNo: [
        //     { required: true, message: '请选择机器ID', trigger: 'change' },
        // ],
        startDate: [
            { required: true, message: '请选择开始日期', trigger: 'change' },
            { validator: this.compareTime, trigger: 'change' }
        ],
        endDate: [
            { required: true, message: '请选择结束日期', trigger: 'change' },
            { validator: this.compareTime, trigger: 'change' }
        ],
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
      }
    }
  },
  mounted(){
    // console.log(urls.ad_list);
    
  },
  methods: {
    onSubmit() {
        this.$refs['deviceSearchForm'].validate((valid) => {
          if (valid) {
            this.$message('正在查询')
            this.queryDevice();
            // this.getAd();
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    queryDevice(){
      let that = this;
      let postData = JSON.parse(JSON.stringify(this.form))

      console.log(postData)
      // return;
      axios.post(`${urls.device_list_full}`, postData)
        .then(function(res){
          if(res.data){
            that.deviceListTableData = res.data.data.map(x=>{
              x.statusStr = statusTypes[x.status];
              return x;
            });
            
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
          console.log(error)

        })
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    },
    
    
    compareTime(rule, value, callback){
      // console.log(arguments);
      // debugger
      if(this.form.beginTime != null && this.form.beginTime != '' && this.form.endTime != null && this.form.endTime != ''
          && this.form.beginTime.getTime() > this.form.endTime.getTime()){
            callback(new Error('开始日期不能晚于结束日期'));
          }
      callback();
    },

    checkPrice(rule, value, callback){
      // console.log(arguments);
      // debugger
      if(value <= 0){
            callback(new Error('折扣价必须大于0'));
          }
      callback();
    },
    checkTotal(rule, value, callback){
      // console.log(arguments);
      // debugger
      if(value <= 0){
            callback(new Error('达标金额必须大于0'));
          }
      callback();
    },
    checkDiscount(rule, value, callback){
      // console.log(arguments);
      // debugger
      if(value <= 0 || value >= 100){
            callback(new Error('折扣百分比必须在1-99之间'));
          }
      callback();
    },
    editDeviceForm(row){
      console.log(row)
      this.nameForm.name = row.showName;
      this.nameForm.id = row.id;
      this.dialogFormVisible = true;
      return;
    },
    editDevice(){
      let that = this;
      this.$refs['nameEditForm'].validate((valid) => {
          if (valid) {

              let postData =
              {
                "id": that.nameForm.id,
                "showName": that.nameForm.name
              }
              axios.put(`${urls.device_update}`, postData)
                .then(function(res){
                  if(res.data){
                    that.deviceListTableData.forEach(x=>{
                      if(x.id == that.nameForm.id){
                        x.showName = that.nameForm.name;
                      } 
                    })
                    that.$message({
                      message: '修改别名成功!',
                      type: 'success'
                    })
                  }else{
                    that.$message({
                      message: '修改别名失败!',
                      type: 'warning'
                    })
                  }
                })
            that.dialogFormVisible = false;
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      
    },
    changeDeviceStatus(row){

      // console.log(postData)
      // return;
      let that = this;
      axios.put(`${urls.device_update_state}${row.id}`)
        .then(function(res){
          that.$set(row, 'status', row.status == 0 ? 1 : 0);
          that.$set(row,'statusStr' ,statusTypes[row.status]);
        })
    },
    deactiveDevice(row){
      let postData = {
        ids : [row.id]
        
      };
      postData.status = 3;
      // console.log(postData)
      // return;
      let that = this;
      axios.put(`${urls.promotion_updatestatus}`, postData)
        .then(function(res){
          that.$set(row, 'status', 3);
          that.$set(row,'statusStr' ,statusTypes[row.status]);
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

