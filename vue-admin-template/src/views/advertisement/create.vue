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
        <el-col :span="8">
          <el-form-item label="广告展示位置" prop="positionType">
            <el-select v-model="form.positionType" placeholder="请选择展示位置">
              <el-option label="待机界面" :value="1"/>
              <el-option label="故障界面" :value="2"/>
              <el-option label="出货界面上部" :value="3"/>
              <el-option label="首屏浮层大图" :value="4"/>
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
            :headers="headers"
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
          <el-form-item label="广告类型" prop="type" >
            <el-select v-model="form.type" placeholder="请选择广告类型" :disabled="ad_type_disabled">
              <el-option label="图片" :value="0"/>
              <el-option label="链接" :value="1"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-show="form.type == '1'">
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
        <el-button type="primary" :loading="loading" @click="onSubmit" :disabled='addButtonDisable'>创建</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import axios from '@/utils/ajax';
import urls from '@/config/urls';

import {parseTime} from '@/utils/index';
let adTypes = {
  0 : '图片',
  1 : '链接',

}
export default {
  data() {
    return {
      form: {
        advertDeviceList : [],
        advertDevice: '',
        title: '',
        startTime: '',
        endTime: '',
        image: '',
        type: 0,
        url: '',
        desc: '',
        positionType: 1,
      },
      options4 : [],
      fileList: [],
      machines : [{
        name : '售货机一号',id:1
      },{
        name : '售货机老大',id:2
      }],
      rules:{
        advertDeviceList: [
            { required: true, message: '请选择售货机', trigger: 'change' },
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
          // name: [
          //   { required: true, message: '请输入活动名称', trigger: 'change' },
          //   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'change' }
          // ],
      },
      loading : false,
      ad_type_disabled : false,
      addButtonDisable : false,
    }
  },
  watch:{
    "form.positionType" : function(newVal, oldVal){
      if(newVal != 1){
        this.form.type = 0;
        this.ad_type_disabled = true;
      }else{
        this.ad_type_disabled = false;
      }
    }
  },
  mounted(){
    // console.log(urls.ad_list);
    let that = this;
    this.loading = true;
    axios.get(`${urls.device_list}?showName=`)
      .then(function(data){
        // console.log(data);
        that.machines = data.data;
      })
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
  },
  computed:{
    headers(){
      return {token : this.$store.state.user.token};
    }
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
            that.loading = true;
            this.$message('正在保存')
            this.createAd().then(function(res){
              that.loading = false;
              debugger
              if(res.data !== false){
                that.$message({
                  message : '创建广告成功,请到广告列表查看',
                  type : 'success',
                });
                that.addButtonDisable = true;
              }else{
                that.$message({
                  message : '新建广告失败',
                  type : 'warning',
                });
              }
                // console.log(res.data.data);
            }).catch(function(){
              that.$message({
                message : '创建广告失败',
                type : 'warning',
              })
              that.loading = false;
            });
            // .then(function(){
            //   that.$message({
            //     message : '创建广告成功,请到广告列表查看',
            //     type : 'success',
            //   })
            //   that.addButtonDisable = true;
            // })
            
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      // this.$message('submit!')
    },
    createAd(){
      let that = this;
      let postData = {
        ...JSON.parse(JSON.stringify(this.form)),
        status : 2,
      };
      postData.startTime = parseTime(postData.startTime,'{y}-{m}-{d}');
      postData.endTime = parseTime(postData.endTime,'{y}-{m}-{d}');
      return axios.post(`${urls.ad_add}`, postData)
        // .then(function(res){
        //   if(res.data !== false){
        //     that.$message({
        //       message : '新建广告成功',
        //       type : 'success',
        //     });
        //   }else{
        //     that.$message({
        //       message : '新建广告失败',
        //       type : 'warning',
        //     });
        //   }
        //     // console.log(res.data.data);
        // })
        // .catch(function(error){
        //   console.log(error)
        // })
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
        console.log(arguments);
        // debugger
        if(this.form.startTime != null && this.form.startTime != '' && this.form.endTime != null && this.form.endTime != ''
            && this.form.startTime.getTime() > this.form.endTime.getTime()){
              callback(new Error('开始日期不能晚于结束日期'));
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

