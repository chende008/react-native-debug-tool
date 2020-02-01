import React, {Component} from 'react'

import {ScrollView, StyleSheet, Text} from 'react-native'

import {Colors} from '../utils/DebugConst'
import {dateFormat, isAndroid, isEmpty, showMsg} from '../utils/DebugUtils'
import {DebugData} from '../utils/DebugData'
import DebugManager from './DebugManager'

export default class SubViewDeviceInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            propList: DebugData.deviceInfoList,//设备信息列表数据
        };
    }

    render() {
        let {propList} = this.state;
        return <ScrollView style={{backgroundColor: Colors.white, paddingTop: 10}}>{
            !isEmpty(propList) && propList.map((item, index) => {
                return !isEmpty(item.value) && <Text key={index} style={styles.title} onPress={() => showMsg(item.value)}>{item.key}：
                    <Text style={{color: Colors.blue, fontSize: 15}}>{item.value}</Text>
                </Text>
            })}
            <Text style={{height: 30}}/>
        </ScrollView>
    }

    componentWillMount() {
        let {DeviceInfo} = DebugManager.default;
        let propList = DebugData.deviceInfoList;
        if (!isEmpty(propList) && isEmpty(propList[0].value)) {//若没有数据，则需要获取一次
            propList.map((item) => {
                if (item.key.includes('时间')) {
                    item.value = dateFormat(DeviceInfo[item.func](), 'yyyy年MM月dd日 hh时mm分ss秒')
                } else {
                    item.value = DeviceInfo[item.func]()
                }
            });
            this.setState({propList: propList});
            isAndroid() && DeviceInfo.getMACAddress().then((macAddress) => {
                propList.push({key: 'Mac地址', value: macAddress});
                this.setState({propList: propList});
            });
            isAndroid() && DeviceInfo.getIPAddress().then((ipAddress) => {
                propList.push({key: 'IP地址', value: ipAddress});
                this.setState({propList: propList});
            });
        }
    }
}

const styles = StyleSheet.create({
    title: {
        fontSize: 16,
        color: Colors.text,
        paddingVertical: 5,
        paddingHorizontal: 15,
    }
});
