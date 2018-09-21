<template>
  <div class="app-container">
    <el-form ref="adCreateForm" :rules="rules" :model="form" label-width="120px">
      <el-row>
        <el-col :span="16">
          <el-form-item label="标题">
            <el-input v-model="form.title"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="售货机" prop="advertDeviceList">
            <el-select v-model="form.advertDeviceList" multiple placeholder="请选择售货机">
              <el-option v-for="(item, index) in machines" :label="item.deviceShowName" :value="item.deviceTaobaoNo" :key="index"/>
            </el-select>
          </el-form-item>
        </el-col>
        
      </el-row>
      <el-row>
      <!-- <el-form-item label="生效期" > -->
        <el-col :span="8">
          <el-form-item label="开始日期" prop="startTime">
            <el-date-picker v-model="form.startTime" type="date" placeholder="开始日期" style="width: 100%;"/>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="2" class="line">-</el-col> -->
        <el-col :span="8">
          <el-form-item label="结束日期" prop="endTime">
            <el-date-picker v-model="form.endTime" type="date" placeholder="结束日期" style="width: 100%;"/>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- </el-form-item> -->
      <el-row>
        <el-col :span="8">
          <el-form-item label="上传图片" prop="image">
          <el-upload
            class="upload-demo"
            action="/apiback/common/upload"
            :on-success="handleUploadSuccess"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            list-type="picture"
            multiple
            :limit="1"
            :on-exceed="handleExceed"
            :file-list="fileList">
            <el-button size="small" type="primary">点击上传</el-button>
            <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
          </el-upload>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="11">
          <el-form-item label="图片" prop="image">
            <el-input :disabled="true" v-model="form.image"></el-input>
          </el-form-item>
        </el-col> -->
      </el-row>
      
      <!-- <el-form-item label="链接">
        <el-input  v-model="form.url"></el-input>
      </el-form-item> -->
      <el-row>
        <el-col :span="8">
          <el-form-item label="广告类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择广告类型">
              <el-option label="图片" :value="0"/>
              <el-option label="链接" :value="1"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-show="form.type == 1">
          <el-form-item label="链接到商品" prop="url">
            <!-- <el-input v-model="form.productTaobaoNo" placeholder="输入商品名称查询"></el-input> -->
              <el-select
                v-model="form.url"
                filterable
                clearable
                placeholder="输入商品名称"
                :loading="loading">
                <el-option
                  v-for="item in options4"
                  :key="item.productTaobaoNo"
                  :label="item.name"
                  :value="item.productTaobaoNo">
                    <span style="float: left">{{ item.productTaobaoNo }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
                </el-option>
              </el-select>
          </el-form-item>
        </el-col>
      </el-row>
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
let adTypes = {
  0 : '图片',
  1 : '链接',
}
export default {
  data() {
    return {
      form: {
        advertDevice: '',
        title: '',
        startTime: '',
        endTime: '',
        image: '',
        type: '0',
        url: '',
        desc: ''
      },
      fileList: [],
      machines : [{
        name : '售货机一号',id:1
      },{
        name : '售货机老大',id:2
      }],
      rules:{
        advertDeviceList: [
            { required: true, message: '请选择机器ID', trigger: 'change' },
        ],
        startTime: [
            { required: true, message: '请选择开始日期', trigger: 'change' },
            { validator: this.compareTime, trigger: 'change' }
        ],
        endTime: [
            { required: true, message: '请选择结束日期', trigger: 'change' },
            { validator: this.compareTime, trigger: 'change' }
        ],
        type: [
            { required: true, message: '请选择广告类型', trigger: 'change' },
        ],
        image: [
            { required: true, message: '请上传一张图片', trigger: 'change' },
        ],
        url : [
            { validator: this.checkUrlItem, trigger: 'change' }
        ]
          // name: [
          //   { required: true, message: '请输入活动名称', trigger: 'change' },
          //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
          // ],
      },
      options4 : [],
      loading : false,
    }
  },
  mounted(){
    // console.log(urls.ad_list);
    let ad_sys_id = getQueryString('id');
    if(ad_sys_id == null){
      this.$router.push({path:'/advertisement/index'});
      return;
    }
    let that = this;
    axios.get(`${urls.device_list}?showName=`)
      .then(function(data){
        // console.log(data);
        that.machines = data.data;
      });
    let postData = 
        {
          "name": '',
          "pageIndex": 0,
          "pageSize": 100,
          "productTaobaoNo": ""
        };
    axios.post(`${urls.product_list}`, postData)
      .then(function(res){
        // console.log(res.data.data);
        that.options4 = res.data.data;
        that.loading = false;
      }).catch(function(error){
        console.log(error);
        that.loading = false;
      })
    axios.get(`${urls.ad_detail}${ad_sys_id}`)
      .then(function(data){
        console.log(data);
        that.form = data.data;
        that.form.startTime = new Date(that.form.startTime);
        that.form.endTime = new Date(that.form.endTime);
        that.form.advertDeviceList = that.form.advertDevice.map(x=>{
          // return parseInt(x.deviceTaobaoNo);
          return x.deviceTaobaoNo;
        });
        if(data.data.image == '' || data.data.image == null){
          that.fileList = [];
        }else{
          that.fileList = data.data.image.split(',').map(function(x, index){
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
      this.form.advertDevice = this.form.advertDeviceList.map(x=>{
        return {deviceTaobaoNo : x.toString()}
      })
      console.log(this.form.advertDevice);
        let that = this;
        this.$refs['adCreateForm'].validate((valid) => {
          if (valid) {
            this.$message('正在保存')
            this.modifyAd().then(function(res){
              if(res.data !== false){
                that.$message({
                  message : '更新广告成功，请重新审核上线',
                  type : 'success',
                });
              }else{
                that.$message({
                  message : '更新广告失败',
                  type : 'warning',
                });
              }
            }).catch(function(){
              that.$message({
                message : '修改广告失败',
                type : 'warning',
              })
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    modifyAd(){
      let that = this;
      let postData = {
        ...JSON.parse(JSON.stringify(this.form)),
        status : 2,
      };
      postData.startTime = parseTime(postData.startTime,'{y}-{m}-{d}');
      postData.endTime = parseTime(postData.endTime,'{y}-{m}-{d}');
      // console.log(postData)
      // return;
      return axios.post(`${urls.ad_edit}`, postData)
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    },
    handleRemove(file, fileList) {
        console.log(file, fileList);
        this.form.image = '';
      },
      handlePreview(file) {
        console.log(file);
        window.open(`${file.url}`);

      },
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },
      beforeRemove(file, fileList) {
        return this.$confirm(`确定移除 ${ file.name }？`);
      },
      handleUploadSuccess(response, file, fileList){
        this.form.image = response.data;
      },
      compareTime(rule, value, callback){
        if(this.form.startTime != null && this.form.startTime != '' && this.form.endTime != null && this.form.endTime != ''
            && this.form.startTime.getTime() > this.form.endTime.getTime()){
              callback(new Error('开始日期不能晚于结束日期'));
            }
        callback();
      },
      checkUrlItem(rule, value, callback){
        if( (this.form.url == null || this.form.url == '') && this.form.type == 1){
              callback(new Error('请选择商品'));
            }
        callback();
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
</style>

