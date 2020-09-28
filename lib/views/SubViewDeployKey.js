import React, { PureComponent } from 'react'

import { ScrollView, Text, TouchableOpacity } from 'react-native'

import { DebugColors } from '../utils/DebugConst'
import { Line } from '../utils/DebugWidgets'
import DebugManager from '../DebugManager'

export default class SubViewDeployKey extends PureComponent {

  constructor(props) {
    super(props)
    this.state = { ...props }
  }

  render() {
    let { changeKeyCallback, deployKeyMap } = DebugManager
    let { currentUrl, keyCallback } = this.state
    return <ScrollView showsVerticalScrollIndicator={false}>{
      [...deployKeyMap.keys()].map((key, index) => {
        let value = deployKeyMap.get(key)
        let isCurrent = currentUrl === value
        return <TouchableOpacity key={index} onPress={() => {
          if (currentUrl === value) return
          changeKeyCallback && changeKeyCallback(key, value)
          this.setState({ currentUrl: value })
          keyCallback && keyCallback(value)
        }}>
          <Text style={{ fontSize: 16, color: isCurrent ? DebugColors.red : DebugColors.text, marginTop: 10, paddingLeft: 10 }}>{key + (isCurrent ? '（当前环境）' : '')}</Text>
          <Text style={{ fontSize: 12, color: DebugColors.text, paddingVertical: 5, paddingLeft: 10 }}>{value}</Text>
          <Line style={{ marginTop: 10 }}/>
        </TouchableOpacity>
      })
    }</ScrollView>
  }
}

