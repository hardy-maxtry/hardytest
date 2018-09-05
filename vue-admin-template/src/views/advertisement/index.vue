<template>
  <div class="app-container">
    <el-form ref="adform" :rules="rules" :model="form" label-width="120px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="售货机" prop="machineID">
            <el-select v-model="form.machineID" placeholder="请选择售货机">
              <el-option v-for="(item, index) in machines" :label="item.name" :value="item.id" :key="index"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="广告类型">
            <el-select v-model="form.adType" placeholder="请选择广告类型">
              <el-option label="图片" value="image"/>
              <el-option label="文字" value="text"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="生效期">
        <el-col :span="6">
          <el-date-picker v-model="form.start" type="date" placeholder="开始日期" style="width: 100%;"/>
        </el-col>
        <!-- <el-col :span="2" class="line">-</el-col> -->
        <el-col :span="6">
          <el-date-picker v-model="form.end" type="date" placeholder="结束日期" style="width: 100%;"/>
        </el-col>
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
      </el-table>
  </div>
</template>

<script>

import axios from 'axios'

let adTypes = {
  0 : '图片',
  1 : '链接',
}

export default {
  data() {
    return {
      form: {
        machineID : '',
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      rules:{
        machineID: [
            { required: true, message: '请选择机器ID', trigger: 'change' },
            
          ],
          // name: [
          //   { required: true, message: '请输入活动名称', trigger: 'change' },
          //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
          // ],
      },
      machines : [{
        name : '售货机一号',id:"1"
      },{
        name : '售货机老大',id:"2"
      }],
      adTableData : [],
    }
  },
  mounted(){
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
      axios.get(`/apifront/advert/list?deviceTaobaoNo=${this.form.machineID}`)
        .then(function(res){
          that.adTableData = res.data.data.map(x=>{
            x.typestr = adTypes[x.type];
            return x;
          });
          console.log(res.data.data)
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

