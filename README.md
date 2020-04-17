# react-native-debug-tool （开发调试工具）

### 功能点

 * 展示设备信息：依赖于 react-native-device-info 基础库
 * 展示当前App的Http请求记录
 * 展示当前App的WebView加载记录
 * App连接服务器环境切换

### 用法

 在项目package.json的 dependencies 节点下引入 
 
 ```jsx
 "react-native-debug-tool": "https://github.com/chende008/react-native-fast-app.git#master"
 ```

 初始化方法：
 
  ```
  DebugManager.initServerUrlMap(serverUrlMap)
              .initCurrentUrl(currentUrl)
              .initDeviceInfo(DeviceInfo)
              .initChangeCallback((baseUrl) => {
  
              }); 
  
  注：初始化方法为非必需方法，如果项目不需要支持【环境切换】与【设备信息查看】功能，可以不调用此方法
  
  // serverUrlMap => 连接服务器环境 key value Map集合
     如：new Map([['test001','https://domain-001.net'],['test002','https://domain-002.net']])
     
  // serverUrl => 默认连接的服务器环境 如：https://domain-001.net
  
  // DeviceInfo => react-native-device-info 库的DeviceInfo对象
  
  // baseUrl => 环境切换回调的当前的连接服务器环境
  
  ```
功能1：展示设备信息（只要在初始化的时候传入DeviceInfo对象即可）

功能2：展示当前App的Http请求记录 （需要在app请求的时候主动调用 DebugManager.httpAppendLogs()方法）

```js

fetch(url, params).then((response) => {
   DebugManager.httpAppendLogs(url, params, response)
})

```
功能3：展示当前App的WebView加载记录 （需要在App的WebView加载页面的时候调用 DebugManager.webViewAppendLogs(url)方法）

```jsx

<WebView source={{uri: url}}
         onNavigationStateChange={params => {
             DebugManager.webViewAppendLogs(params.url)
         }}
/>

```

功能4：App连接服务器环境切换(在初始化的时候传入severUrlMap及serverUrl，在回调的时候存在本地供Http使用)


调试工具开发入口打开方法：
```js

import RootSibling from 'react-native-root-siblings';

DebugManager.showFloat(new RootSibling()) //在App内需要的地方调用些方法展示工具入口浮点

```
