<template>
    <div>
        <el-row>
            <el-table
                :data="tableData.data"
                v-loading="tableData.loading"
                
                style="width: 100%">
                <el-table-column v-for="(column, index) in tableData.columns" 
                    v-bind:prop="column.columnName" 
                    v-bind:label="column.label" 
                    v-bind:width="column.width" 
                    :key="index"
                    min-width="20rem" >
                </el-table-column>
                <!-- <el-table-column fixed="right" label="操作" v-bind="buttons" min-width="40rem">
                    <template slot-scope="scope">
                        <el-button  v-for="(item, index) in buttons" 
                            @click.native.prevent="item.fn(scope.$index, filteredTableData)"  
                            size="small" 
                            :key="index" 
                            v-if="item.show(scope.$index, filteredTableData)"
                            :style="{float: item.right ? 'right' : 'left' }"
                            :type="item.buttonType"
                            :disabled="!!item.disabled">
                        {{item.label}}
                        </el-button>
                    </template>
                </el-table-column> -->
            </el-table>
        </el-row>
        <el-row>
            <el-pagination
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-size="50"
                layout="total, prev, pager, next, jumper"
                :total="totalOrders">
            </el-pagination>
        </el-row>
    </div>
</template>

<script>
export default {
  name: 'tableWithPages',
  props: {
    tableData: {
      type: Object,
    },
    totalOrders: {
        type :Number
    },
    pageChanged:{
        type :Function
    }
  },
  data: function(){
      return {
          currentPage : 1
      }
  },
  computed: {

  },
  methods:{
      handleCurrentChange(val){
          this.pageChanged(val);
      }
  }
}
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
