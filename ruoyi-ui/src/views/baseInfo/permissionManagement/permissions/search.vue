<template>
<div class="search_container">
  <div class="search_input">
    <div class="input_container">
      <!-- <div class="test"></div> -->
      <input type="text" v-model="context" placeholder="请输入搜索内容" @keyup.enter="handleSearch">
      <div class="icon_container" @click="handleSearch">
        <i class="fa fa-search"></i>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'search',
  data() {
    return {
      context: ''
    };
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.context);
    }
  }
}
</script>

<style lang="scss" scoped>
.search_input {
  display: inline-block;
  margin-left: 15px;
  width: 200px;
  height: 36px;
  border: 1px solid #aaa;
  border-radius: 3px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  .input_container {
    width: 100%;
    height: 100%;
    line-height: 34px;
    .test {
      width: 100%;
      height: 100%;
    }
    input {
      width: 80%;
      height: 100%;
      padding: 0 8px;
      border: none;
      outline: none;
      font-size: 14px;
    }
    .icon_container {
      display: inline-block;
      width: 20%;
      height: 100%;
      border-left: 1px solid #aaa;
      text-align: center;
      cursor: pointer;
      &:hover {
        background-color: rgba(0, 0, 0, .3);
        color: white;
      }
    }
  }
}
</style>