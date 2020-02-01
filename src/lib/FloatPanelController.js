import React, {PureComponent} from 'react'
import {Animated, Dimensions, Image, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import SubViewLogHttp from './SubViewLogHttp'
import SubViewDeviceInfo from './SubViewDeviceInfo'
import SubViewLogWebView from './SubViewLogWebView'
import SubViewServerUrl from './SubViewServerUrl'
import {Colors, DebugConst} from '../utils/DebugConst'
import {DebugItem, Line} from '../utils/Widgets'
import {iosX, isEmpty, isIos, selfOr} from '../utils/DebugUtils'
import DebugManager from './DebugManager'

const IconRadius = 25 * 2;//浮点直径
const screenWidth = DebugConst.screenWidth;//屏幕宽度
const screenHeight = DebugConst.screenHeight;//屏幕高度
const RightPadding = screenWidth - IconRadius - 10;

export default class FloatPanelController extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            title: '',
            currentUrl: '',
            contentView: null,
            isOpen: false,
            toFloat: true,
            animating: false,
            animateValue: new Animated.Value(0),
            translateValue: new Animated.ValueXY({x: RightPadding, y: 300}),
        };
        this.lastValueY = 300;
        this.lastValueX = RightPadding;
        this.listenerValue = {x: RightPadding, y: 300};
        this.pageTransformAnim = new Animated.Value(screenWidth / 2)//页面切换动画
    }

    render() {
        let {translateValue, animateValue, contentView, title, currentUrl} = this.state;
        let animalStyle = {
            width: animateValue.interpolate({
                inputRange: [0, 1],
                outputRange: [IconRadius, screenWidth],
            }),
            height: animateValue.interpolate({
                inputRange: [0, 1],
                outputRange: [IconRadius, screenHeight],
            }),
            borderRadius: animateValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [IconRadius * 0.5, 20, 0],
            }),
        };
        let transformStyle = {transform: translateValue.getTranslateTransform()};
        return <Animated.View style={[{zIndex: 0, overflow: 'hidden', position: 'absolute'}, animalStyle, transformStyle]}>
            <View style={{flex: 1, marginTop: isIos() ? 45 : 0}}>
                <ScrollView horizontal={true}
                            pagingEnabled={true}
                            scrollEnabled={false}
                            showsHorizontalScrollIndicator={false}
                            ref={scrollView => this.scrollView = scrollView}>
                    {this.renderPageFirst(currentUrl)}
                    {this.renderPageSecond(contentView, title)}
                </ScrollView>
            </View>
            {this.renderFloatBtn()}
        </Animated.View>
    }

    renderPageFirst = (currentUrl) => {
        let {DeviceInfo} = DebugManager.default;
        return <View style={{flex: 1, width: screenWidth, backgroundColor: Colors.white}}>
            <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: 'white'}}>
                <Text style={[styles.titleStyle, {flex: 1}]}>调试设置</Text>
                <Text style={styles.rightText} onPress={() => this.close()}>最小化</Text>
            </View>
            <Line/>
            {DeviceInfo && <DebugItem text='设备信息' onPress={() => this.changeToDetail(1, 'DeviceInfo', '设备信息')} showLine/>}
            <DebugItem text='Http请求日志' onPress={() => this.changeToDetail(1, 'LogHttp', 'Http请求日志')} showLine/>
            <DebugItem text='WebView请求日志' onPress={() => this.changeToDetail(1, 'LogWebView', 'WebView请求日志')} showLine/>
            {!isEmpty(currentUrl) && <DebugItem title='环境切换' text={currentUrl} style={{color: Colors.red, fontSize: 13}} onPress={() => this.changeToDetail(1, 'EnvironmentChange', '服务器环境切换')} showLine/>}
            <Text style={styles.exitBtn} onPress={() => this.close(true)}>退出调试工具</Text>
        </View>
    };

    renderPageSecond = (contentView, title) => {
        return <View style={{flex: 1, width: screenWidth, backgroundColor: Colors.white}}>
            <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: 'white'}}>
                <TouchableOpacity style={styles.backBtn} onPress={() => this.changeToDetail(0)}>
                    <Image style={{width: 10, height: 16}} source={{uri: DebugConst.iconBack}}/>
                    <Text style={[styles.titleStyle, {fontSize: 15, paddingLeft: 5}]}>返回</Text>
                </TouchableOpacity>
                <Text style={[styles.titleStyle, {flex: 3}]}>{selfOr(title, '数据加载中...')}</Text>
                {title.includes('Http请求日志') ?
                    <TouchableOpacity style={{flex: 1}} onPress={() => {
                        if (DebugManager.getHttpLogs().length > 0) {
                            DebugManager.clearHttpLogs();
                            this.changeToDetail(0)
                        }
                    }}><Text style={[styles.titleStyle, {fontSize: 15}]}>清空</Text>
                    </TouchableOpacity> : <View style={{flex: 1}}/>}
            </View>
            <Line/>
            {contentView}
        </View>
    };

    changeToDetail = (pageIndex, type, title) => {//跳转页面码
        Animated.timing(this.pageTransformAnim, {toValue: screenWidth / 2 * (pageIndex + 1)}).start();
        this.scrollView.scrollResponderScrollTo({x: screenWidth * pageIndex, y: 0, animated: true});
        this.pageTransformAnim.addListener((anim) => {
            if (pageIndex === 1 && anim.value >= screenWidth) {//当切换到第二个页面时,展示详情
                this.renderContentView(type, title)
            }
            if (pageIndex === 0) {//切换到第一页面是，清空数据
                this.setState({contentView: null, title: ''})
            }
        })
    };

    renderContentView = (type, title) => {//渲染第二页面内容布局
        let contentView = null;
        switch (type) {
            case 'DeviceInfo'://设备信息
                contentView = <SubViewDeviceInfo/>;
                break;
            case 'LogHttp'://Http请求日志
                contentView = <SubViewLogHttp/>;
                break;
            case 'LogWebView'://webView加载日志
                contentView = <SubViewLogWebView/>;
                break;
            case 'EnvironmentChange'://服务器环境切换
                contentView = <SubViewServerUrl currentUrl={this.state.currentUrl} callback={(url) => {
                    this.setState({currentUrl: url});
                    this.changeToDetail(0)
                }}/>;
                break
        }
        this.setState({contentView: contentView, title: title})
    };

    renderFloatBtn() {
        let {isOpen, toFloat, animating} = this.state;
        if (!isOpen && toFloat && !animating) {
            return <View{...this.gestureResponder.panHandlers} style={styles.floatBtn}>
                <Image source={{uri: DebugConst.iconLink}} style={{width: IconRadius / 2, height: IconRadius / 2}}/>
            </View>
        }
        return null
    }

    close = (exit = false) => {//关闭页面
        let {animating, toFloat, isOpen} = this.state;
        if (exit) {//退出调试功能
            DebugManager.destroy();
            this.pageTransform(false);
            setTimeout(() => {
                this.props.close && this.props.close()
            }, 600)
        }
        if (animating) return;
        if (toFloat) isOpen && this.pageTransform(false)
    };


    open = () => {//打开页面
        !this.state.isOpen && this.pageTransform(true)
    };

    componentWillMount() {
        this.state.translateValue.addListener(
            value => (this.listenerValue = value),
        );
        this.gestureResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: this.onFloatInit,
            onPanResponderMove: this.onFloatMove,
            onPanResponderRelease: this.onFloatRelease,
            onPanResponderTerminate: this.onFloatRelease,
        });
        this.setState({currentUrl: DebugManager.default.currentUrl})
    }

    pageTransform = (isOpen) => {//页面切换动画
        this.setState({animating: true});

        Animated.parallel([
            Animated.timing(this.state.animateValue, {
                toValue: isOpen ? 1 : 0,
                duration: 500,
            }),
            Animated.timing(this.state.translateValue.y, {
                toValue: isOpen ? 0 : this.lastValueY,
                duration: 500,
            }),
            Animated.timing(this.state.translateValue.x, {
                toValue: isOpen ? 0 : this.lastValueX,
                duration: 500,
            }),
        ]).start(() => {
            this.setState({isOpen: isOpen, animating: false})
        })
    };

    onFloatInit = (event, gestureState) => {
        this.time = Date.parse(new Date());
        this.state.translateValue.setOffset(this.listenerValue);
        this.state.translateValue.setValue({x: 0, y: 0})
    };

    onFloatMove = (evt, gestureState) => {//浮点
        Animated.event([null, {dx: this.state.translateValue.x, dy: this.state.translateValue.y}])(evt, gestureState);
        const {dx, dy} = gestureState
    };

    onFloatRelease = (evt, gestureState) => {
        let {translateValue} = this.state;
        translateValue.flattenOffset();
        const y = translateValue.y.__getValue();
        if (y < 10 || y > screenHeight - IconRadius - 10) {//处理浮点Y轴
            Animated.spring(translateValue.y, {
                toValue: y < 10 ? 10 : screenHeight - IconRadius - 10,
                duration: 200,
            }).start()
        }
        Animated.spring(translateValue.x, {//处理浮点X轴
            toValue: gestureState.moveX > screenWidth * 0.5 ? RightPadding : 10,
            duration: 200,
        }).start();

        // 记录最后一次位移值
        this.lastValueX = translateValue.x.__getValue();
        this.lastValueY = translateValue.y.__getValue();

        this.releaseTime = Date.parse(new Date());
        // single tap
        if (this.releaseTime - this.time < 50 &&
            Math.abs(gestureState.dx) < 10 &&
            Math.abs(gestureState.dy) < 10) {//点击打开页面
            !this.state.isOpen && this.open()
        }
    };

};

const styles = StyleSheet.create({
    floatBtn: {
        left: 0,
        top: 0,
        borderRadius: IconRadius / 2,
        height: IconRadius,
        width: IconRadius,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'gray',
    },
    titleStyle: {
        fontSize: 17,
        color: Colors.text,
        textAlign: 'center',
        paddingVertical: 12,
        backgroundColor: Colors.white,
    },
    rightText: {
        right: 0,
        padding: 10,
        fontSize: 13,
        color: Colors.text,
        position: 'absolute',

    },
    backBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    exitBtn: {
        left: 15,
        right: 15,
        padding: 10,
        marginTop: 30,
        borderWidth: 1,
        borderRadius: 5,
        textAlign: 'center',
        position: 'absolute',
        color: Colors.text_light,
        borderColor: Colors.line,
        bottom: iosX() ? 35 : 10,
        backgroundColor: Colors.page_bg,
    },
})
