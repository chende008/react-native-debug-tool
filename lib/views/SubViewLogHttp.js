import React, {Component} from 'react'

import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native'

import DebugManager from '../DebugManager'
import {DebugColors} from '../utils/DebugConst'
import {dateFormat, isEmpty, showMsg} from '../utils/DebugUtils'

export default class SubViewLogHttp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataList: DebugManager.getHttpLogs()
        };
    }

    render() {
        let {dataList} = this.state;
        return <ScrollView>{dataList.map((item, index) => {
            return <View key={index} style={styles.borderStyle}>
                <Text style={styles.title} onPress={() => showMsg(item.apiName)}>
                    <Text style={{fontWeight: 'bold'}}>接口名：</Text>{item.apiName}
                </Text>
                <Text style={styles.title} onPress={() => showMsg(item.url)}>
                    <Text style={{fontWeight: 'bold'}}>请求Url：</Text>{item.url}
                </Text>
                <Text style={styles.title} onPress={() => showMsg(item.method)}>
                    <Text style={{fontWeight: 'bold'}}>请求Method：</Text>{item.method}
                </Text>
                {!isEmpty(item.headers) && <Text style={styles.title} onPress={() => showMsg(item.headers)}>
                    <Text style={{fontWeight: 'bold'}}>请求Headers：</Text>{item.headers}
                </Text>}
                {!isEmpty(item.body) && <Text style={styles.title} onPress={() => showMsg(item.body)}>
                    <Text style={{fontWeight: 'bold'}}>请求Body：</Text>{item.body}
                </Text>}
                <Text style={styles.showAll} onPress={() => this.requestRetry(item)}>{item.completed ? '重新请求' : '获取完整结果'}</Text>
                <Text style={styles.title} onPress={() => showMsg(item.result)}>
                    <Text style={{fontWeight: 'bold'}}>请求结果：</Text>{item.result}
                </Text>
                <Text style={styles.title}>
                    <Text style={{fontWeight: 'bold'}}>请求时间：</Text>{item.timeStr}
                </Text>
            </View>
        })}
        </ScrollView>
    }

    requestRetry = (item) => {//重新请求
        let {dataList} = this.state;
        let {method, headers, body} = item;
        let params = {method};
        if (!isEmpty(headers)) {
            params.headers = JSON.parse(headers);
        }
        if (!isEmpty(body)) {//若有body，则拼接body
            params.body = JSON.parse(body);
        }
        fetch(item.url, params).then((response) => {
            if (response.status >= 200 && response.status < 400) {
                if (response && !isEmpty(response._bodyText)) {
                    item.result = response._bodyText;
                    item.timeStr = dateFormat(new Date(), 'MM月dd日 hh时mm分ss秒');
                    item.completed = true;
                } else {
                    let reader = new FileReader();
                    reader.addEventListener("loadend", () => {
                        item.result = reader.result;
                        item.timeStr = dateFormat(new Date(), 'MM月dd日 hh时mm分ss秒');
                        item.completed = true;
                        this.setState({dataList});
                    });
                    reader.readAsText(response._bodyBlob);
                }
            } else {
                Alert.alert('请求失败，错误码' + response.status);
                item.completed = false;
            }
            this.setState({dataList});
        }).catch(error => {
            Alert.alert('请求异常')
        })
    };
}

const styles = StyleSheet.create({
    title: {
        fontSize: 12,
        color: 'black',
        marginVertical: 2,
        paddingVertical: 3,
        paddingHorizontal: 3
    },
    borderStyle: {
        borderWidth: 1,
        borderRadius: 2,
        marginVertical: 3,
        marginHorizontal: 3,
        borderColor: DebugColors.line
    },
    showAll: {
        padding: 6,
        fontSize: 14,
        marginRight: 8,
        borderRadius: 5,
        color: DebugColors.white,
        alignSelf: 'flex-end',
        backgroundColor: DebugColors.orange
    }
});
