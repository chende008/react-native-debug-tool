import React from 'react'

import {costTimeWork, dateFormat, isEmpty, getApiName} from './utils/DebugUtils'
import FloatPanelController from './views/FloatPanelController'

let httpRequestLogs = [], webViewLoadLogs = [], normalLogs = [], debugLogOff = true;

export default class DebugManager {

    static initServerUrlMap(serverUrlMap, currentUrl, changeCallback) {
        DebugManager.currentUrl = currentUrl;
        DebugManager.serverUrlMap = serverUrlMap;
        DebugManager.changeCallback = changeCallback;
        return DebugManager
    }

    static initStagingKeyMap(deployKeyMap, currentKey, changeKeyCallback) {
        DebugManager.currentKey = currentKey;
        DebugManager.deployKeyMap = deployKeyMap;
        DebugManager.changeKeyCallback = changeKeyCallback;
        return DebugManager
    }

    static initDeviceInfo(deviceInfo) {
        DebugManager.DeviceInfo = deviceInfo;
        return DebugManager
    }

    static appendHttpLogs(params, response, parseResult) {//Http请求日志（请求结果过大的数据不保存） parseResult->用于临时解析
        if (debugLogOff || isEmpty(response)) return;
        if (isEmpty(response._bodyText) && isEmpty(parseResult)) {
            let reader = new FileReader();
            reader.addEventListener('loadend', () => this.appendHttpLogs(params, response, reader.result))
            reader.readAsText(response._bodyBlob)
        } else {
            let resultStr = isEmpty(parseResult) ? response._bodyText : parseResult;
            costTimeWork(() => {
                let obj = {
                    url: response.url,
                    method: params.method,
                    apiName: getApiName(response.url),
                    headers: JSON.stringify(params.headers),
                    body: JSON.stringify(params.body),
                    result: resultStr.substr(0, 2000),
                    completed: resultStr.length < 2000,
                    timeStr: dateFormat(new Date(), 'MM月dd日 hh时mm分ss秒S毫秒')
                };
                httpRequestLogs.unshift(obj);
                if (httpRequestLogs.length > 30) {
                    httpRequestLogs.splice(10)
                }//若日志个数大于30，则删除前10个
            })
        }
    }

    static appendWebViewLogs(loadUrl) {//webView加载Url
        if (debugLogOff) return;
        costTimeWork(() => {
            webViewLoadLogs.unshift({url: loadUrl, timeStr: dateFormat(new Date(), 'MM月dd日 hh时mm分ss秒S毫秒')})
            if (webViewLoadLogs.length > 100) {
                webViewLoadLogs.splice(20)
            }//若url个数大于100，则删除前20个
        })
    }

    static appendLogs(text) {
        if (debugLogOff) return;
        costTimeWork(() => {
            normalLogs.unshift({log: text, timeStr: dateFormat(new Date(), 'MM月dd日 hh时mm分ss秒S毫秒')})
            if (normalLogs.length > 100) normalLogs.splice(20)//若url个数大于100，则删除前20个
        })
    }

    static getHttpLogs() {//获取Http请求日志列表
        return httpRequestLogs
    }

    static clearHttpLogs() {//清除Http请求日志列表
        httpRequestLogs = []
    }

    static getWebLoadLogs() {//获取webView加载日志列表
        return webViewLoadLogs
    }

    static getLogText() {//获取其它日志列表
        return normalLogs
    }

    static destroy() {
        httpRequestLogs = [];
        webViewLoadLogs = [];
        normalLogs = [];
        debugLogOff = true
    }

    static showFloat(RootSiblings, style) { // type of  RootSiblings (3.x)
        debugLogOff = false;
        if (this.sibling) {
            this.sibling.update(<FloatPanelController style={style} close={() => this.sibling.destroy()}/>)
        } else {
            this.sibling = new RootSiblings(<FloatPanelController style={style} close={() => this.sibling.destroy()}/>)
        }
    }
}
