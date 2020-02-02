import React from 'react'

import {costTimeWork, dateFormat, isEmpty} from './utils/DebugUtils'
import RootSibling from 'react-native-root-siblings'
import FloatPanelController from './lib/FloatPanelController'

let httpRequestLogs = [], webViewLoadLogs = [];

export default class DebugManager {

    static logOn = false;

    static default = {//设置参数非必须
        serverUrlMap: '',//环境列表的Map集合 new Map([['test001','https://domain-001.net'],['test002','https://domain-002.net']])
        currentUrl: '', //当前默认的环境
        changeCallback: '',//环境切换的回调 (url) => { }
        DeviceInfo: '',// react-native-device-info 对象
    };

    static httpLogs(params, response, parseResult) {//Http请求日志（请求结果过大的数据不保存） parseResult->用于临时解析
        if (!this.logOn || isEmpty(response)) return;
        if (isEmpty(response._bodyText) && isEmpty(parseResult)) {
            let reader = new FileReader();
            reader.addEventListener('loadend', () => this.httpLogs(params, response, reader.result));
            reader.readAsText(response._bodyBlob)
        } else {
            let resultStr = isEmpty(parseResult) ? response._bodyText : parseResult;
            costTimeWork(() => {
                let obj = {
                    url: response.url,
                    method: params.method,
                    apiName: DebugManager.getApiName(response.url),
                    headers: JSON.stringify(params.headers),
                    body: JSON.stringify(params.body),
                    result: resultStr.substr(0, 2000),
                    completed: resultStr.length < 2000,
                    timeStr: dateFormat(new Date(), 'MM月dd日 hh时mm分ss秒'),
                };
                httpRequestLogs.unshift(obj);
                if (httpRequestLogs.length > 20) httpRequestLogs.splice(10)//若日志个数大于20，则删除前10个
            })
        }
    }

    static webViewAppendLogs(loadUrl) {//webView加载Url
        if (!this.logOn) return;
        costTimeWork(() => {
            webViewLoadLogs.unshift({url: loadUrl, timeStr: dateFormat(new Date(), 'MM月dd日 hh时mm分ss秒')});
            if (webViewLoadLogs.length > 30) webViewLoadLogs.splice(20)//若url个数大于30，则删除前20个
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

    static getApiName(url) {
        if (url.indexOf('?') > 0) {
            return url.replace(/^https?.*(com|net|org|cn)\/(.+)\?.*$/, '$2')
        } else {
            return url.replace(/^https?.*(com|net|org|cn)\/(.+)\\?.*$/, '$2')
        }
    }

    static destroy() {
        httpRequestLogs = [];
        webViewLoadLogs = [];
        DebugManager.logOn = false
    }

    static showFloat() {
        DebugManager.logOn = true;
        if (this.sibling == null) {
            this.sibling = new RootSibling(<FloatPanelController close={() => {
                this.sibling.destroy();
                this.sibling = null
            }}/>)
        }
    }
}
