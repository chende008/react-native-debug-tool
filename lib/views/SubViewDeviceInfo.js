import React, {Component} from 'react';

import {ScrollView, StyleSheet, Text} from 'react-native';

import {DebugColors, DebugConst} from '../utils/DebugConst';
import {dateFormat, isAndroid, isEmpty, showMsg} from '../utils/DebugUtils';
import DebugManager from '../DebugManager';

export default class SubViewDeviceInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            infos: [],
        };
    }

    componentWillMount(): void {
        let {infos} = this.state;
        let {DeviceInfo} = DebugManager;
        if (isEmpty(DeviceInfo)) {
            return null;
        }
        for (let method in DeviceInfo) {
            if (method.endsWith('Sync')) {
                continue;
            }
            let info = {};
            try {
                if (method.startsWith('get')) {
                    info.name = method.substr(3);
                } else {
                    info.name = method;
                }
                let maxlength = 30, offsetLength;
                let result = DeviceInfo[method]();
                offsetLength = maxlength - (String(method)).length;
                if (result instanceof Promise) {
                    result.then((data) => {
                        if (typeof data === 'object') {
                            info.value = JSON.stringify(data);
                        } else {
                            if (method.endsWith('Time')) {
                                info.value = dateFormat(data, 'yyyy-MM-dd hh:mm:ss');
                            } else {
                                info.value = String(data);
                            }
                        }
                        info.value && infos.push(info);
                        this.setState({infos});
                    });
                } else {
                    info.value = result;
                    info.value && infos.push(info);
                    this.setState({infos});
                }
            } catch (e) {
            }
        }
    }

    render() {
        let {infos} = this.state;
        return <ScrollView style={{backgroundColor: DebugColors.white}}>{
            !isEmpty(infos) && infos.map(({name, value}, index) => {
                return <Text key={index} style={styles.title} onPress={() => showMsg(value)}>{name}：
                    <Text style={{color: DebugColors.blue, fontSize: 15}}>{value}</Text>
                </Text>;
            })}
            <Text style={{height: 3}}/>
        </ScrollView>;
    }
}

const styles = StyleSheet.create({
    title: {
        fontSize: 16,
        marginTop: 1,
        color: DebugColors.text,
        paddingVertical: 5,
        paddingHorizontal: 15,
        backgroundColor: DebugColors.disable,
    },
});
