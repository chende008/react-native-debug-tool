import React, {PureComponent} from 'react'
import {
    Animated,
    Dimensions,
    Image,
    View,
    Text,
    PanResponder,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView
} from 'react-native'

import SubViewLogHttp from './SubViewLogHttp'
import SubViewDeviceInfo from './SubViewDeviceInfo'
import SubViewLogWebView from './SubViewLogWebView'
import SubViewServerUrl from './SubViewServerUrl'
import SubViewDeployKey from './SubViewDeployKey'
import {DebugColors, DebugImgs} from '../utils/DebugConst'
import {DebugItem, Line} from '../utils/DebugWidgets'
import {isEmpty, selfOr, showMsg} from '../utils/DebugUtils'
import DebugManager from '../DebugManager'

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const IconRadius = 25 * 2//浮点直径
const RightPadding = screenWidth - IconRadius - 10;
const topMargin = screenHeight * 0.6//浮点初始位置距顶部高度

export default class FloatPanelController extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            title: '',
            currentUrl: '',
            currentKey: '',
            contentView: null,
            isOpen: false,
            toFloat: true,
            animating: false,
            animateValue: new Animated.Value(0),
            translateValue: new Animated.ValueXY({x: RightPadding, y: topMargin}),
            dataChangedCount: 0
        };
        this.lastValueY = topMargin;
        this.lastValueX = RightPadding;
        this.listenerValue = {x: RightPadding, y: topMargin};
        this.pageTransformAnim = new Animated.Value(screenWidth / 2)//页面切换动画
    }

    render() {
        let {translateValue, animateValue, contentView, title, currentUrl, currentKey} = this.state
        let animalStyle = {
            width: animateValue.interpolate({
                inputRange: [0, 1],
                outputRange: [IconRadius, screenWidth]
            }),
            height: animateValue.interpolate({
                inputRange: [0, 1],
                outputRange: [IconRadius, screenHeight]
            }),
            borderRadius: animateValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [IconRadius * 0.5, 20, 0]
            })
        };
        let transformStyle = {transform: translateValue.getTranslateTransform()};
        return <Animated.View style={[{zIndex: 0, overflow: 'hidden', position: 'absolute', ...this.props.style}, animalStyle, transformStyle]}>
            <SafeAreaView style={{flex: 1}}>
                <ScrollView horizontal={true}
                            pagingEnabled={true}
                            scrollEnabled={false}
                            showsHorizontalScrollIndicator={false}
                            ref={scrollView => this.scrollView = scrollView}>
                    {this.renderPageFirst(currentUrl, currentKey)}
                    {this.renderPageSecond(contentView, title)}
                </ScrollView>
            </SafeAreaView>
            {this.renderFloatBtn()}
        </Animated.View>
    }

    renderPageFirst = (currentUrl, currentKey) => {
        return <View style={{flex: 1, width: screenWidth, backgroundColor: DebugColors.white}}>
            <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: 'white'}}>
                <Text style={[styles.titleStyle, {flex: 1}]}>调试设置</Text>
                <Text style={styles.rightText} onPress={() => this.close()}>最小化</Text>
            </View>
            <Line/>
            {DebugManager.DeviceInfo && <DebugItem text='设备信息' onPress={() => this.changeToDetail(1, 'DeviceInfo', '设备信息')} showLine/>}
            <DebugItem text='Http请求日志' onPress={() => this.changeToDetail(1, 'LogHttp', 'Http请求日志')} showLine/>
            <DebugItem text='WebView请求日志' onPress={() => this.changeToDetail(1, 'LogWebView', 'WebView请求日志')} showLine/>
            {!isEmpty(DebugManager.serverUrlMap) && <DebugItem title='环境切换' text={currentUrl} style={{color: DebugColors.red, fontSize: 13}} onPress={() => this.changeToDetail(1, 'EnvironmentChange', '服务器环境切换')} showLine/>}
            {!isEmpty(DebugManager.deployKeyMap) && <DebugItem title='热更新渠道' text={currentKey} style={{color: DebugColors.red, fontSize: 13}} onPress={() => this.changeToDetail(1, 'DeployKeyChange', '热更新渠道切换')} showLine/>}
            <ScrollView style={{marginVertical: 15}}>{
                DebugManager.getLogText().map((item, index) => {
                    return <View key={index} style={styles.borderStyle}>
                        <Text style={styles.title} onPress={() => showMsg(item.log)}>日志：
                            <Text style={{color: DebugColors.blue}}>{item.log}</Text>
                        </Text>
                        <Text style={styles.title}>
                            <Text style={{color: DebugColors.text_light}}>时间：</Text>{item.timeStr}
                        </Text>
                    </View>
                })}
            </ScrollView>
            <Text style={styles.exitBtn} onPress={() => this.close(true)}>退出调试工具</Text>
        </View>
    };

    renderPageSecond = (contentView, title) => {
        return <View style={{flex: 1, width: screenWidth, backgroundColor: DebugColors.white}}>
            <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: 'white'}}>
                <TouchableOpacity style={styles.backBtn} onPress={() => this.changeToDetail(0)}>
                    <Image style={{width: 10, height: 16}} source={{uri: DebugImgs.iconBack}}/>
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
        Animated.timing(this.pageTransformAnim, {toValue: screenWidth / 2 * (pageIndex + 1), useNativeDriver: false}).start()
        this.scrollView.scrollTo({x: screenWidth * pageIndex, y: 0, animated: true})
        this.pageTransformAnim.addListener((anim) => {
            if (pageIndex === 1 && anim.value >= screenWidth) {//当切换到第二个页面时,展示详情
                this.renderContentView(type, title)
            }
            if (pageIndex === 0) {//切换到第一页面时，清空数据
                this.setState({contentView: null, title: ''});
                setTimeout(() => this.setState({dataChangedCount: this.state.dataChangedCount + 1}), 800)
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
                break;
            case 'DeployKeyChange'://热更新部署Key切换
                contentView = <SubViewDeployKey currentUrl={this.state.currentKey} keyCallback={(value) => {
                    this.setState({currentKey: value});
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
                <Image source={{uri: DebugImgs.iconLink}} style={{width: IconRadius / 2, height: IconRadius / 2}}/>
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
        if (isEmpty(this.state.currentUrl)) {
            this.setState({currentUrl: DebugManager.currentUrl})
        }
        if (isEmpty(this.state.currentKey)) {
            this.setState({currentKey: DebugManager.currentKey})
        }
        !this.state.isOpen && this.pageTransform(true)
    };

    componentWillMount() {
        this.state.translateValue.addListener(
            value => (this.listenerValue = value)
        );
        this.gestureResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: this.onFloatInit,
            onPanResponderMove: this.onFloatMove,
            onPanResponderRelease: this.onFloatRelease,
            onPanResponderTerminate: this.onFloatRelease
        });
        this.setState({currentUrl: DebugManager.currentUrl})
    }

    pageTransform = (isOpen) => {//页面切换动画
        this.setState({animating: true});

        Animated.parallel([
            Animated.timing(this.state.animateValue, {
                toValue: isOpen ? 1 : 0,
                duration: 500,
                useNativeDriver: false
            }),
            Animated.timing(this.state.translateValue.y, {
                toValue: isOpen ? 0 : this.lastValueY,
                duration: 500,
                useNativeDriver: false
            }),
            Animated.timing(this.state.translateValue.x, {
                toValue: isOpen ? 0 : this.lastValueX,
                duration: 500,
                useNativeDriver: false
            })
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
        Animated.event([null, {dx: this.state.translateValue.x, dy: this.state.translateValue.y}])(evt, gestureState)
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
                useNativeDriver: false
            }).start()
        }
        Animated.spring(translateValue.x, {//处理浮点X轴
            toValue: gestureState.moveX > screenWidth * 0.5 ? RightPadding : 10,
            duration: 200,
            useNativeDriver: false
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
    }

};

const styles = StyleSheet.create({
    floatBtn: {
        left: 0,
        top: 0,
        borderRadius: IconRadius / 2,
        borderColor: DebugColors.blue,
        borderWidth: 2,
        height: IconRadius,
        width: IconRadius,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'gray'
    },
    titleStyle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: DebugColors.text,
        textAlign: 'center',
        paddingVertical: 15,
        backgroundColor: DebugColors.white
    },
    rightText: {
        right: 0,
        padding: 10,
        fontSize: 13,
        color: DebugColors.text,
        position: 'absolute'

    },
    backBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    exitBtn: {
        padding: 10,
        marginTop: 10,
        borderWidth: 0.5,
        borderRadius: 5,
        margin: 10,
        textAlign: 'center',
        color: DebugColors.text_light,
        borderColor: DebugColors.line,
        backgroundColor: DebugColors.page_bg
    },
    title: {
        fontSize: 14,
        marginTop: 1,
        color: DebugColors.text_light,
        paddingVertical: 5,
        paddingHorizontal: 15,
        backgroundColor: DebugColors.disable
    },
    borderStyle: {
        borderWidth: 0.5,
        borderRadius: 2,
        marginVertical: 3,
        marginHorizontal: 10,
        borderColor: DebugColors.line
    }
});
