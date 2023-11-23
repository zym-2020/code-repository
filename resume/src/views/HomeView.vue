<template>
  <div class="body">
    <div class="pic">
      <img src="/xjpic.jpg" alt="" />
    </div>
    <div class="name">张益铭</div>
    <!-- <div style="text-align: center">求职意向：测绘技术岗1</div> -->
    <el-divider content-position="left"
      ><span class="divider-text">个人信息</span></el-divider
    >
    <div class="info">
      <div>
        <ul>
          <li>性&nbsp;&nbsp;别：男</li>
          <li>年&nbsp;&nbsp;龄：24</li>
          <li>专&nbsp;&nbsp;业：地图学与地理信息系统</li>
        </ul>
      </div>
      <div class="contact">
        <ul>
          <li>
            手&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;机：18674334803
          </li>
          <li>
            邮&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;箱：ymzhang@nnu.edu.cn
          </li>
          <li>github主页：https://github.com/zym-2020</li>
        </ul>
      </div>
    </div>
    <el-divider content-position="left"
      ><span class="divider-text">教育经历</span></el-divider
    >
    <div class="education">
      <ul>
        <li>
          <span class="school">南京师范大学</span>
          <span class="major">地图学与地理信息系统</span>
          <span class="degree">硕士</span>
          <span class="time">2021.09 —— 2024.06</span>
        </li>
        <li>
          <span class="school">中南林业科技大学</span>
          <span class="major">地理信息科学</span>
          <span class="degree">学士</span>
          <span class="time">2017.09 —— 2021.06</span>
        </li>
      </ul>
    </div>
    <el-divider content-position="left"
      ><span class="divider-text">项目经历</span></el-divider
    >
    <div class="project">
      <ul>
        <li>
          <div class="project-name">
            <strong>长江南京以下野外观测数据平台</strong>（全栈开发 2022.05——）
          </div>
          <!-- <div>在线地址：http://39.101.65.98:8080/</div>
          <div class="tips">
            (部署在个人阿里云服务器上，配置低，初次访问资源加载过慢)
          </div> -->
          <div style="height: 30px; line-height: 30px">
            github地址：https://github.com/zym-2020/Yangtze
          </div>
          <div style="margin-top: 15px"><strong>项目简介：</strong></div>
          <div style="text-indent: 30px">
            与南京水利科学研究院合作的科研项目，建设集成长江观测的历史数据、实时的IOT监测数据、第三方数据的数据共享平台。包括数据资源门户，GIS分析，一张图（航运一张图、工程一张图、实时监测一张图、长江流场模拟）
          </div>
          <div style="margin-top: 15px"><strong>项目特色：</strong></div>
          <div>
            <ul>
              <li>每类数据都对应一种可视化方法且易于扩展</li>
              <li>具备GIS的分析功能（断面分析，坡度坡向、冲淤分析等）</li>
              <li>
                流场的模拟策略为创新技术（自己用webgl绘制的，非调用第三方库）
              </li>
              <li>接入了IOT实时监测数据及第三方的长江网络数据</li>
            </ul>
          </div>
          <div style="margin-top: 15px"><strong>所用技术栈：</strong></div>
          <div>
            <ul>
              <li>
                前端：vue3、typescript、mapbox、openlayers、element-plus、webgl
              </li>
              <li>
                后端：springboot、mybatis、redis、postgresql、postgis、gdal
              </li>
            </ul>
          </div>
        </li>
        <li style="margin-top: 30px">
          <div class="project-name">
            <strong>模型培训班交作业系统</strong>（全栈开发 2022.07）
          </div>
          <div style="margin-top: 15px"><strong>项目简介：</strong></div>
          <div style="text-indent: 30px">
            课题组举办的国产模型培训班活动，报名参加的学员需要提交课后作业，通过该平台提交作业，作业批改后在平台发放证书
          </div>
        </li>
        <li style="margin-top: 30px">
          <div class="project-name">
            <strong>地理可复现平台</strong>（参与部分开发 2021.09——2022.05）
          </div>
          <div class="tips">研究生阶段参与的第一个web项目</div>
          <div style="margin-top: 15px"><strong>项目简介：</strong></div>
          <div style="text-indent: 30px">
            课题组的纵向研究课题方向，依托opengms平台（https://geomodeling.njnu.edu.cn，课题组的一项重要成果，将模型发布成网络服务，利用分布式的架构与网络共享的优势进行开放共享建模）的模型服务构建模型工作流
          </div>
          <div style="margin-top: 15px"><strong>项目特色：</strong></div>
          <div>
            <ul>
              <li>用mxgraph构建的模型工作流</li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
    <el-divider content-position="left"
      ><span class="divider-text">技能树</span></el-divider
    >
    <div class="skill">
      <ul>
        <li>熟悉html5，css3，js，es6，http协议，tcp协议等相关规范</li>
        <li style="word-break: break-all">
          能熟练使用vue3/vuex/typescript/pinia/axios/element/mapbox/openlayers等前端开发技术，springboot/mybatis/postgresql等后端开发技术
        </li>
        <li>了解webpack/nginx相关配置，能使用webgl进行简单可视化</li>
      </ul>
    </div>
    <el-divider content-position="left"
      ><span class="divider-text">学生期间成果</span></el-divider
    >
    <div>
      <ul>
        <li>第九届“共享杯”科技资源共享服务创新大赛——优秀奖</li>
        <li>第十届“共享杯”科技资源共享服务创新大赛——优秀奖</li>
        <li>软件著作——《长江南京以下航道泛在信息集成系统》</li>
        <!-- <li>《Computers and Geosciences》上发表论文《A Geometry-Based Method for Visualizing Time-varying Flow Fields on Map Platforms Using Texture Polymorphism》（三作）</li> -->
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<style lang="scss" scoped>
.body {
  width: 800px;

  margin: 20px auto;
  padding: 30px 20px;
  border: solid 2px #d4d4d4;
  position: relative;
  .el-divider {
    margin-bottom: 15px;
    border-top-color: #8b8b8b;
    .divider-text {
      font-size: 16px;
      font-weight: 600;
    }
  }
  ul {
    margin: 0px;
  }
  .pic {
    position: absolute;
    right: 100px;
    height: 90px;
    img {
      height: 100%;
    }
  }
  .name {
    font-size: 40px;
    font-weight: 600;
    text-align: center;
  }
  .info {
    display: flex;
    line-height: 25px;

    .contact {
      margin-left: 150px;
    }
  }
  .education {
    line-height: 25px;
    span {
      display: inline-block;
    }
    .school {
      width: 200px;
    }
    .major {
      width: 250px;
    }
    .degree {
      width: 100px;
    }
  }
  .project {
    .project-name {
      height: 40px;
      line-height: 40px;
      font-size: 20px;
    }
    .tips {
      font-size: 12px;
    }
  }
}
</style>