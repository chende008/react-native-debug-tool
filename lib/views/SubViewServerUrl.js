import React, {PureComponent} from 'react'

import {ScrollView, Text, TouchableOpacity} from 'react-native'

import {DebugColors} from '../utils/DebugConst'
import {Line} from "../utils/DebugWidgets";
import DebugManager from '../DebugManager'

export default class SubViewServerUrl extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {...props};
    }

    render() {
        let {changeCallback, serverUrlMap} = DebugManager;
        let {currentUrl, callback} = this.state;
        return <ScrollView showsVerticalScrollIndicator={false}>{
            [...serverUrlMap.keys()].map((key, index) => {
                let value = serverUrlMap.get(key);
                let isCurrent = currentUrl === value;
                return <TouchableOpacity key={index} onPress={() => {
                    if (currentUrl === value) return;
                    changeCallback && changeCallback(value);
                    this.setState({currentUrl: value});
                    callback && callback(value);
                }}>
                    <Text style={{fontSize: 16, color: isCurrent ? DebugColors.red : DebugColors.text, marginTop: 10, paddingLeft: 10}}>{key + (isCurrent ? '（当前渠道）' : '')}</Text>
                    <Text style={{fontSize: 12, color: DebugColors.text, paddingVertical: 5, paddingLeft: 10}}>{value}</Text>
                    <Line style={{marginTop: 10}}/>
                </TouchableOpacity>
            })
        }</ScrollView>
    }
}

