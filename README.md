# react-native-debug-tool （开发调试工具）


### 安装

npm install react-native-debug-tool --save 

or yarn add react-native-debug-tool


### 功能点

 * 支持显示设备信息：依赖于 react-native-device-info 基础库
 * 支持显示当前App的Http请求记录
 * 支持显示示当前App的WebView加载记录
 * 支持App连接服务器环境切换

### 用法

 初始化方法：
 
  ```
  DebugManager.initDeviceInfo(DeviceInfo)
  .initServerUrlMap(serverUrlMap, currentUrl, (baseUrl) => {
  
  })
  .initStagingKeyMap(deployKeyMap, currentKey, (currentKey) => {
  
  });
  
  注：初始化方法为非必需方法，如果项目不需要支持【环境切换】与【设备信息查看】功能，可以不调用此方法
  
  // DeviceInfo => react-native-device-info 库的DeviceInfo对象
  
  // serverUrlMap => 连接服务器环境 key value Map集合
     如：new Map([['test001','https://domain-001.net'],['test002','https://domain-002.net']])
     
  // serverUrl => 默认连接的服务器环境 如：https://domain-001.net
  
  // baseUrl => 环境切换回调的当前的连接服务器环境
  
  ```
功能1：展示设备信息（只要在初始化的时候传入DeviceInfo对象即可）

功能2：展示当前App的Http请求记录 

```js

fetch(url, params).then((response) => {
   DebugManager.appendHttpLogs({url, ...params}, response)
})

```
功能3：展示当前App的WebView加载记录

```jsx

<WebView source={{uri: url}}
         onNavigationStateChange={params => {
             DebugManagerDebugManager.appendWebViewLogs(params.url);
         }}
/>

```

功能4：App连接服务器环境切换(在初始化的时候传入severUrlMap及serverUrl，在回调的时候存在本地供Http使用)


调出调试工具入口：
```js

import RootSibling from 'react-native-root-siblings';

DebugManager.showFloat(RootSibling) //在App内需要的地方调用些方法展示工具入口浮点

// only support react-native-root-siblings 3.x

```

详细使用方法请参考 [示例](https://github.com/chende008/react-native-easy-app-sample)
