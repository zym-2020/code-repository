<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/demo1">demo1</router-link>
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
