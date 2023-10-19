<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/map">Map</router-link>
  </nav>
  <router-view />
</template>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}
</style>
