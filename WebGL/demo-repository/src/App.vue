<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/demo1">demo1</router-link> |
    <router-link to="/demo2">demo2</router-link> |
    <router-link to="/demo3">demo3</router-link> |
    <router-link to="/demo4">demo4</router-link> |
    <router-link to="/demo5">demo5</router-link> |
    <router-link to="/demo6">demo6</router-link> |
    <router-link to="/demo7">demo7</router-link> |
    <router-link to="/demo8">demo8</router-link> |
    <router-link to="/symbol">symbol</router-link> 
    
  </nav>
  <router-view />
</template>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-size: 16px;
  #app {
    height: 100%;
  }
  nav {
    height: 2rem;
  }
}
</style>
