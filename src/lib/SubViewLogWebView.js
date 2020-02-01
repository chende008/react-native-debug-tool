import React, {PureComponent} from 'react'

import {ScrollView, StyleSheet, Text, View} from 'react-native'

import DebugManager from './DebugManager'
import {Colors} from '../utils/DebugConst'
import {showMsg} from '../utils/DebugUtils'

export default class SubViewLogWebView extends PureComponent {

    render() {
        return <ScrollView style={{marginBottom: 10}}>{
            DebugManager.getWebLoadLogs().map((item, index) => {
                return <View key={index} style={styles.borderStyle}>
                    <Text style={styles.title} onPress={() => showMsg(item.url)}>
                        <Text style={{fontWeight: 'bold'}}>请求Url：</Text>{item.url}
                    </Text>
                    <Text style={styles.title}>
                        <Text style={{fontWeight: 'bold'}}>请求时间：</Text>{item.timeStr}
                    </Text>
                </View>
            })}
        </ScrollView>
    }
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
        marginHorizontal: 10,
        borderColor: Colors.line
    }
});
