<template>
  <div class="app-container">
    <el-form ref="adform" :rules="rules" :model="form" label-width="120px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="售货机" prop="deviceTaobaoNo ">
            <el-select v-model="form.deviceTaobaoNo" placeholder="请选择售货机">
              <el-option v-for="(item, index) in machines" :label="item.deviceShowName" :value="item.deviceTaobaoNo" :key="index"/>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="8">
          <el-form-item label="广告类型">
            <el-select v-model="form.adType" placeholder="请选择广告类型">
              <el-option label="图片" value="image"/>
              <el-option label="文字" value="text"/>
            </el-select>
          </el-form-item>
        </el-col> -->
      </el-row>
      
      <el-form-item label="生效期" prop="startDate">
        <el-col :span="6">
          <el-date-picker v-model="form.startDate" type="date" placeholder="开始日期" style="width: 100%;"/>
        </el-col>
        <!-- <el-col :span="2" class="line">-</el-col> -->
        <el-col :span="6">
          <el-date-picker v-model="form.endDate" type="date" placeholder="结束日期" style="width: 100%;"/>
        </el-col>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status" placeholder="请选择">
          <el-option
            v-for="item in ad_options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
      <el-table
        :data="adTableData"
        stripe
        style="width: 100%">
        <el-table-column
          prop="title"
          label="广告标题"
          width="200">
        </el-table-column>
        <el-table-column
          prop="statusStr"
          label="广告状态"
          width="200">
        </el-table-column>
        <el-table-column
          prop="typestr"
          label="广告类型"
          width="100">
        </el-table-column>
        <el-table-column
          prop="image"
          label="图片地址">
        </el-table-column>
        <el-table-column
          prop="url"
          label="跳转地址">
        </el-table-column>
        <el-table-column
          prop="startTime"
          label="开始日期">
        </el-table-column>
        <el-table-column
          prop="endTime"
          label="结束日期">
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
        deviceTaobaoNo  : '',
        pageSize: 100,
        pageIndex: 1,
        startDate: new Date(new Date().getTime()-7*24*3600*1000),
        endDate: new Date(new Date().getTime()+7*24*3600*1000),
        status: 0,
      },
      ad_options:[{
        label : '不限',
        value : 0,
      },{
        label : '上线',
        value : 1,
      },{
        label : '下线',
        value : 2,
      }],
      rules:{
        deviceTaobaoNo : [
            { required: true, message: '请选择机器ID', trigger: 'change' },
            
          ],
        startDate : [
            { required: true, message: '请选择日期', trigger: 'change' },
            
          ],
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
      adTableData : [],
    }
  },
  mounted(){
    // console.log(urls.ad_list);
    let that = this;
    axios.get(`${urls.device_list}?showName=`)
      .then(function(data){
        console.log(data);
        that.machines = data.data;
      })
  },
  methods: {
    onSubmit() {
      this.$refs['adform'].validate((valid) => {
          if (valid) {
            this.$message('查询中')
            this.getAd();
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
    getAd(){
      let that = this;
      let postData = this.form;
      axios.post(`${urls.ad_list}`,postData)
        .then(function(res){
          that.adTableData = res.data.data.map(x=>{
            x.typestr = adTypes[x.type];
            x.startTime = parseTime(new Date(x.startTime),'{y}年{m}月{d}日');
            x.endTime = parseTime(new Date(x.endTime),'{y}年{m}月{d}日');
            x.statusStr = adStatus[x.status];
            x.machine = x.advertDevice[0].deviceShowName;
            return x;
          });
          // console.log(res.data.data)
        })
        .catch(function(error){
          console.log(error)
        })
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

