import React from 'react'

import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {imgUrl, isEmpty} from './DebugUtils'
import {DebugColors, DebugImgs} from './DebugConst'

export function Line({style, ...props}) {//水平分割线
    return <View style={[{backgroundColor: DebugColors.line, height: 0.5}, style]} {...props}/>
}

export function DebugItem({onPress, style, ...props}) {
    let {showLine, title, text} = props;
    let lineStyle = showLine ? {borderBottomWidth: 0.3, borderBottomColor: DebugColors.line} : {}
    return <TouchableOpacity style={[{flexDirection: 'row', alignItems: 'center'}, lineStyle]} onPress={onPress}>
        {!isEmpty(title) && <Text style={[styles.itemStyle, {flex: 0}]}>{title}</Text>}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.itemStyle}>{text}</Text>
            <Image style={{width: 20, height: 20, marginRight: 10}} source={{uri: DebugImgs.rightArrow}}/>
        </View>
    </TouchableOpacity>
}


const styles = StyleSheet.create({
    itemStyle: {
        flex: 1,
        fontSize: 14,
        color: DebugColors.text,
        paddingVertical: 16,
        paddingLeft: 15
    }
})
