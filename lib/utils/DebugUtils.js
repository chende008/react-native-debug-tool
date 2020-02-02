import {Alert, Clipboard, Platform} from 'react-native'
import InteractionManager from 'react-native/Libraries/Interaction/InteractionMixin'
import {DebugConst} from './DebugConst'

export function showMsg(data) {
    Clipboard.setString(data);
    Alert.alert('【以下内容】已复制剪切板', '\n' + data + '\n')
}

export function isEmpty(obj) {
    if (obj === undefined || obj == null) return true;
    if (Array.isArray(obj) && obj.length === 0) {//数组
        return true;
    } else {
        if (typeof obj === 'string' && obj.trim() === '') return true;//字符串
    }
    return false;
}

export function toStr(target) {//返回字符串
    return typeof target === 'object' ? JSON.stringify(target) : target;
}

export function selfOr(self, another = null) {//返回自己或者另一个对象
    if (Array.isArray(self)) {
        return !isEmpty(self) ? self : []
    } else {
        return !isEmpty(self) ? self : another
    }
}

export function dateFormat(dateTime = (new Date()).valueOf(), format = "yyyy-MM-dd") {
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateTime)) return dateTime;
    let date = new Date(dateTime);
    let o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(format)) format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
    return format;
}

export function isAndroid() {//判断平台为Android
    return Platform.OS === 'android'
}

export function isIos() {//判断平台为IOS
    return Platform.OS === 'ios'
}

export function iosX() {//判断平台为IOSX以上的型号
    return isIos() && DebugConst.screenHeight >= 812
}

export function isApp() {//判断平台为客户端
    return isAndroid() || isIos();
}

export function isFunc(func) {//判断输入的是否是function
    return func && typeof func === 'function';
}

export function costTimeWork(func) {//耗时操作
    InteractionManager.runAfterInteractions(() => {
        isFunc(func) && func();//若传的是有效方法，则回调
    })
}

export function imgUrl(icon) {
    let newIcon = icon;
    if (isEmpty(icon) || icon.startsWith('http')) {//若为空或者有效的url
        return icon;
    }
    if (!(icon.endsWith('.png') || icon.endsWith('.jpg') || icon.endsWith('.jpeg'))) {//若没有添加扩展名，则添加扩展
        newIcon = icon + '.png';
    }
    if (!newIcon.startsWith('http')) {//若不包含协议头，则添加
        newIcon = DebugConst.Assets + newIcon;
    }
    return newIcon;
}
