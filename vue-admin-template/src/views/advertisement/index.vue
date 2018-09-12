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
          <template slot-scope="scope">
            <span v-if="scope.row.status==1" style="color:#5baf5b;">{{ scope.row.statusStr }}</span>
            <span v-else-if="scope.row.status==2" style="color:#f78989;">{{ scope.row.statusStr }}</span>
            <span v-else>{{ scope.row.statusStr }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="typestr"
          label="广告类型"
          width="100">
        </el-table-column>
        <el-table-column
          prop="image"
          label="图片地址">
          <template slot-scope="scope">
            <!-- <el-button @click="handleClick(scope.row)" type="text" size="small">编辑</el-button> -->
            <a :href="scope.row.imageUrl" target="_blank"><img :src="scope.row.imageUrl" style="height:70px;width:70px;" /></a>
            <!-- <el-button type="text" size="small">编辑</el-button> -->
          </template>
        </el-table-column>
        <el-table-column
          prop="url"
          label="跳转地址">
        </el-table-column>
        <el-table-column
          prop="startTimeStr"
          label="开始日期">
        </el-table-column>
        <el-table-column
          prop="endTimeStr"
          label="结束日期">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="250">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="info" size="mini">编辑</el-button>
            <el-button @click="activeAd(scope.row)" type="success" size="mini">上线</el-button>
            <el-button @click="deactiveAd(scope.row)" type="danger" size="mini">下线</el-button>
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
            { validator: this.compareTime, trigger: 'change' }
          ],
        endDate :[
            { required: true, message: '请选择日期', trigger: 'change' },
            { validator: this.compareTime, trigger: 'change' }
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
            x.startTimeStr = parseTime(new Date(x.startTime),'{y}年{m}月{d}日');
            x.endTimeStr = parseTime(new Date(x.endTime),'{y}年{m}月{d}日');
            x.statusStr = adStatus[x.status];
            x.machine = x.advertDevice[0].deviceShowName;
            x.imageUrl = urls.url_prefix + '/' + x.image;
            return x;
          });
          // console.log(res.data.data)
        })
        .catch(function(error){
          console.log(error)
        })
    },
    handleClick(row){
      this.$router.push({ path: `/advertisement/modify?id=${row.id}` })
      return;
      console.log(arguments)
    },
    compareTime(rule, value, callback){
      console.log(arguments);
      // debugger
      if(this.form.startDate != null && this.form.startDate != '' && this.form.endDate != null && this.form.endDate != ''
          && this.form.startDate.getTime() > this.form.endDate.getTime()){
            callback(new Error('开始日期不能晚于结束日期'));
          }
      callback();
    },
    activeAd(row){
      let postData = {
        ...JSON.parse(JSON.stringify(row)),
        
      };
      postData.status = 1;
      postData.startTime = parseTime(postData.startTime,'{y}-{m}-{d}');
      postData.endTime = parseTime(postData.endTime,'{y}-{m}-{d}');
      // console.log(postData)
      // return;
      let that = this;
      axios.post(`${urls.ad_edit}`, postData)
        .then(function(res){
          that.$set(row, 'status', 1);
          that.$set(row,'statusStr' ,adStatus[row.status]);
        })
    },
    deactiveAd(row){
      let postData = {
        ...JSON.parse(JSON.stringify(row)),
        
      };
      postData.status = 2;
      postData.startTime = parseTime(postData.startTime,'{y}-{m}-{d}');
      postData.endTime = parseTime(postData.endTime,'{y}-{m}-{d}');
      // console.log(postData)
      // return;
      let that = this;
      axios.post(`${urls.ad_edit}`, postData)
        .then(function(res){
          that.$set(row, 'status', 2);
          that.$set(row,'statusStr' ,adStatus[row.status]);
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

