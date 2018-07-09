/**
 * Created by Joker on 2018-04-12.
 * react-native-swiper
 */
import React, {Component} from 'react'
import {
    Text,
    View,
    ScrollView,
    Dimensions,
    TouchableWithoutFeedback,
    ViewPagerAndroid,
    Platform,
    Animated,
    ActivityIndicator,
    Easing,
    PanResponder

} from 'react-native'
import PropTypes from 'prop-types'

const {width, height} = Dimensions.get('window')


export default class SFSprite extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: new Animated.Value(0),
            y: new Animated.Value(0),
            zIndex: 0,
            width: new Animated.Value(0),
            height: new Animated.Value(0),
            opacity: new Animated.Value(1),
            anchorPointX: 0.5,
            anchorPointY: 0.5,
            rotate: new Animated.Value(0),
            scaleX: new Animated.Value(1),
            scaleY: new Animated.Value(1),
            visible: true,
            enable: true
        }
        this.hitLines = []
        this.hitRadius = 0;
        this.defaultEasing = Easing.out(Easing.linear);
        this.lastPosX = 0
        this.lastPosY = 0;
    }

    static propTypes = {
        tag: PropTypes.number,
        source: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]).isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        visible: PropTypes.bool,
        canDrag: PropTypes.bool,
        rotate: PropTypes.number,
        opacity: PropTypes.number,
        x: PropTypes.number,
        y: PropTypes.number,
        anchorPointX: PropTypes.number,
        anchorPointY: PropTypes.number,
        scaleX: PropTypes.number,
        scaleY: PropTypes.number,
        resizeModel: PropTypes.string,
        showHitBox: PropTypes.bool,
        showHitBoxColor: PropTypes.string,
        onPress: PropTypes.func,
        onPressIn: PropTypes.func,
        onPressOut: PropTypes.func,
        onMoveBegin: PropTypes.func,
        onMove: PropTypes.func,
        onMoveEnd: PropTypes.func,
    }
    static defaultProps = {
        tag: 0,
        resizeModel: 'stretch',
        x: 0,
        y: 0,
        rotate: 0,
        opacity: 1,
        anchorPointX: 0.5,
        anchorPointY: 0.5,
        scaleX: 1,
        scaleY: 1,
        canDrag: false,
        visible: true,
        showHitBox: false,
        showHitBoxColor: 'white'
    }

    componentWillMount() {
        this.initValue = {};
        this.initValue.rotate = this.props.rotate;
        this.initValue.opacity = this.props.opacity;
        this.initValue.anchorPointX = this.props.anchorPointX;
        this.initValue.anchorPointY = this.props.anchorPointY;
        this.initValue.scaleX = this.props.scaleX;
        this.initValue.scaleY = this.props.scaleY;
        this.initValue.width = this.props.width;
        this.initValue.height = this.props.height;
        this.initValue.x = this.props.x;
        this.initValue.y = this.props.y;
        this.initValue.visible = this.props.visible;
        this.reset();

        this._panResponder = PanResponder.create({
            // 要求成为响应者：
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => {

                return true;
            },
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

            onPanResponderGrant: (evt, gestureState) => {
                if (this.state.enable == false) {
                    return;
                }
                this._onPanResponderGrant(evt, gestureState)
            },
            onPanResponderMove: (evt, gestureState) => {
                if (this.state.enable == false) {
                    return;
                }
                this._onPanResponderMove(evt, gestureState);
            },
            onPanResponderTerminationRequest: (evt, gestureState) => false,
            onPanResponderRelease: (evt, gestureState) => {
                if (this.state.enable == false) {
                    return;
                }
                this._onPanResponderRelease(evt, gestureState)
            },
            onPanResponderTerminate: (evt, gestureState) => {
                // 另一个组件已经成为了新的响应者，所以当前手势将被取消。
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
                // 返回一个布尔值，决定当前组件是否应该阻止原生组件成为JS响应者
                // 默认返回true。目前暂时只支持android。
                return true;
            },
        });
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    _onPanResponderGrant = (evt, gestureState) => {
        this._onPressIn();
        this.lastPosX = null;
        this.lastPosY = null;
        this.lastTapTime = new Date().getTime();
        if (this.props.onMoveBegin && this.props.canDrag) {
            this.props.onMoveBegin({
                tag: this.props.tag,
                touchX: evt.nativeEvent.pageX,
                touchY: evt.nativeEvent.pageY
            });
        }
    }
    _onPanResponderMove = (evt, gestureState) => {
        if (this.props.canDrag == false) {
            return;
        }
        if (this.props.onMove) {
            this.props.onMove({
                tag: this.props.tag,
                touchX: evt.nativeEvent.pageX,
                touchY: evt.nativeEvent.pageY
            });
        }
        // x 位移
        let diffX = gestureState.dx - this.lastPosX;
        if (this.lastPosX === null) {
            diffX = 0
        }
        // y 位移
        let diffY = gestureState.dy - this.lastPosY;
        if (this.lastPosY === null) {
            diffY = 0
        }

        if (this.hitLines.length >= 2){
            for (var i = 0; i < this.hitLines.length-1; i++){
                var p1 = this.hitLines[i];
                var p2 = this.hitLines[i+1];
                var dis_x = this.centerToLineDis({
                    x:this.getCenterX()+diffX,
                    y:this.getCenterY(),
                    startx:p1.x,
                    starty:p1.y,
                    endx:p2.x,
                    endy:p2.y
                });
                var dis_y = this.centerToLineDis({
                    x:this.getCenterX(),
                    y:this.getCenterY()+diffY,
                    startx:p1.x,
                    starty:p1.y,
                    endx:p2.x,
                    endy:p2.y
                });
                if (dis_x < this.hitRadius){
                    diffX = 0;
                }
                if (dis_y < this.hitRadius){
                    diffY = 0;
                }
                if (diffX == 0|| diffY == 0){
                    break;
                }
            }
        }

        this.state.x.setValue(this.state.x._value + diffX);
        this.state.y.setValue(this.state.y._value + diffY);

        this.lastPosX = gestureState.dx;
        this.lastPosY = gestureState.dy;
    }
    _onPanResponderRelease = (evt, gestureState) => {
        this.lastPosX = null;
        this.lastPosY = null;
        if (this.props.onMoveEnd && this.props.canDrag) {
            this.props.onMoveEnd({
                tag: this.props.tag,
                touchX: evt.nativeEvent.pageX,
                touchY: evt.nativeEvent.pageY
            });
        }


        if (this.checkPointIn({x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY})) {//在精灵内
            const stayTime = new Date().getTime() - this.lastTapTime;
            const moveDistance = Math.sqrt(gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy)
            if (this.props.canDrag) {
                if (evt.nativeEvent.changedTouches.length <= 1 && stayTime < 300 && moveDistance < 10) {
                    this._onPress();
                }
            } else {
                this._onPress();
            }
        } else {
            this._onPressOut()
        }
    }
    _onPress = () => {
        if (this.props.onPress) {
            this.props.onPress(this.props.tag)
        }
    }
    _onPressIn = () => {
        if (this.props.onPressIn) {
            this.props.onPressIn(this.props.tag)
        }
    }
    _onPressOut = () => {
        if (this.props.onPressOut) {
            this.props.onPressOut(this.props.tag)
        }
    }
    _convertShowToRealX = (showx) => {
        var realx = showx - this.state.anchorPointX * this.props.width;
        return realx;
    }
    _convertShowToRealY = (showy) => {
        var realy = showy - this.state.anchorPointY * this.props.height;
        return realy;
    }
    _convertRealToShowX = () => {
        var showx = this.state.x._value + this.state.anchorPointX * this.props.width;
        return showx;
    }
    _convertRealToShowY = () => {
        var showy = this.state.y._value + this.state.anchorPointY * this.props.height;
        return showy;
    }
    centerToLineDis = ({x:x, y:y, startx:startx, starty:starty, endx:endx, endy:endy}) => {
        var se =  (startx-endx)*(startx-endx)+(starty-endy)*(starty-endy);//线段两点距离平方
        var p = ((x-startx)*(endx-startx)+(y-starty)*(endy-starty)); //向量点乘=|a|*|b|*cosA
        var r = p/se; //r即点到线段的投影长度与线段长度比
        var outx=startx+r*(endx-startx);
        var outy=starty+r*(endy-starty);
        var des =(x-outx)*(x-outx)+(y-outy)*(y-outy);
        return Math.round(Math.sqrt(des));
    }

    checkPointIn = ({x:x, y:y}) => {
        var minx = this._convertRealToShowX() - this.state.anchorPointX * this.getSize().w;
        var miny = this._convertRealToShowY() - this.state.anchorPointY * this.getSize().h;
        var maxx = minx + this.getSize().w;
        var maxy = miny + this.getSize().h;
        if ((x >= minx && x <= maxx) && (y >= miny && y <= maxy)) {

            return true;
        }
        return false;
    }
    checkSpriteIn = (sprite) => {
        return this.checkRectIn({
            x: sprite.getPosX() - sprite.getAnchorPointX() * sprite.getSize().w,
            y: sprite.getPosY() - sprite.getAnchorPointY() * sprite.getSize().h,
            w: sprite.getSize().w,
            h: sprite.getSize().h
        })
    }
    checkRectIn = ({x:x, y:y, w:w, h:h}) => {
        var minx1 = x;//l1
        var miny1 = y;//t1
        var maxx1 = x + w;//r1
        var maxy1 = y + h;//b1

        var minx2 = this._convertRealToShowX() - this.state.anchorPointX * this.getSize().w;//l2
        var miny2 = this._convertRealToShowY() - this.state.anchorPointY * this.getSize().h;//t2
        var maxx2 = minx2 + this.getSize().w;//r2
        var maxy2 = miny2 + this.getSize().h;//b2
        if (miny1 > maxy2 || maxx1 < minx2 || maxy1 < miny2 || minx1 > maxx2) {
            return false;
        } else {
            return true;
        }
    }
    checkLineIn = ({px1:px1, py1:py1, px2:px2, py2:py2}) => {
        var minx = this._convertRealToShowX() - this.state.anchorPointX * this.getSize().w;
        var miny = this._convertRealToShowY() - this.state.anchorPointY * this.getSize().h;
        var maxx = minx + this.getSize().w;
        var maxy = miny + this.getSize().h;
        var lineHeight = py1 - py2;
        var lineWidth = px2 - px1;  // 计算叉乘
        var c = px1 * py2 - px2 * py1;
        if ((lineHeight * minx + lineWidth * miny + c >= 0 && lineHeight * maxx + lineWidth * maxy + c <= 0)
            || (lineHeight * minx + lineWidth * miny + c <= 0 && lineHeight * maxx + lineWidth * maxy + c >= 0)
            || (lineHeight * minx + lineWidth * maxy + c >= 0 && lineHeight * maxx + lineWidth * miny + c <= 0)
            || (lineHeight * minx + lineWidth * maxy + c <= 0 && lineHeight * maxx + lineWidth * miny + c >= 0)) {

            if (minx > maxx) {
                var temp = minx;
                minx = maxx;
                maxx = temp;
            }
            if (miny < maxy) {
                var temp1 = miny;
                miny = maxy;
                maxy = temp1;
            }
            if ((px1 < minx && px2 < minx)
                || (px1 > maxx && px2 > maxx)
                || (py1 > miny && py2 > miny)
                || (py1 < maxy && py2 < maxy)) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    reset = () => {
        this.state.width.setValue(this.initValue.width);
        this.state.height.setValue(this.initValue.height);
        this.state.rotate.setValue(this.initValue.rotate);
        this.state.opacity.setValue(this.initValue.opacity);
        this.state.anchorPointX = this.initValue.anchorPointX;
        this.state.anchorPointY = this.initValue.anchorPointY;
        this.state.scaleX.setValue(this.initValue.scaleX);
        this.state.scaleY.setValue(this.initValue.scaleY);
        this.state.x.setValue(this._convertShowToRealX(this.initValue.x));
        this.state.y.setValue(this._convertShowToRealY(this.initValue.y));
        this.setState({visible: this.initValue.visible})
    }
    setHitLines = (pointAry,r) => {
        this.hitLines = pointAry;
        this.hitRadius = r;
    }
    setEnable = (value) => {
        this.setState({enable: value})
    }
    setVisible = (value) => {
        this.setState({visible: value});
    }
    setPos = ({x:x, y:y}) => {
        this.setPosX({x: x});
        this.setPosY({y: y});
    }
    setPosX = ({x:x}) => {
        this.state.x.setValue(this._convertShowToRealX(x));
    }
    setPosY = ({y:y}) => {
        this.state.y.setValue(this._convertShowToRealY(y));
    }
    setScale = ({x:x, y:y}) => {
        this.setScaleX({x: x});
        this.setScaleY({y: y})
    }
    setScaleX = ({x:x}) => {
        this.state.scaleX.setValue(x);
    }
    setScaleY = ({y:y}) => {
        this.state.scaleY.setValue(y);
    }
    setRotate = ({angle:angle}) => {
        this.state.rotate.setValue(angle);
    }
    setOpacity = ({opacity:opacity}) => {
        this.state.opacity.setValue(opacity);
    }
    setAnchorPoint = ({x:x, y:y}) => {
        this.setAnchorPointX({x: x});
        this.setAnchorPointY({y: y});
    }
    setAnchorPointX = ({x:x}) => {
        this.state.anchorPointX.setValue(x);
    }
    setAnchorPointY = ({y:y}) => {
        this.state.anchorPointY.setValue(y);
    }
    getVisible = () => {
        return this.state.visible;
    }
    getSize = () => {
        return {
            w: this.props.width * this.state.scaleX._value,
            h: this.props.height * this.state.scaleY._value,
        }
    }
    getPos = () => {
        return {x: this.getPosX(), y: this.getPosY()}
    }
    getPosX = () => {
        return this._convertRealToShowX();
    }
    getPosY = () => {
        return this._convertRealToShowY();
    }
    getPosRealX = () => {
        return this.state.x._value;
    }
    getPosRealY = () => {
        return this.state.y._value;
    }
    getPosReal = () => {
        return {x: this.getPosRealX(), y: this.getPosRealY()}
    }
    getScale = () => {
        return {x: this.getScaleX(), y: this.getScaleY()};
    }
    getScaleX = () => {
        return this.state.scaleX._value;
    }
    getScaleY = () => {
        return this.state.scaleY._value;
    }
    getRotate = () => {
        return this.state.rotate._value;
    }
    getOpacity = () => {
        return this.state.opacity._value;
    }
    getAnchorPoint = () => {
        return {x: this.getAnchorPointX(), y: this.getAnchorPointY()};
    }
    getAnchorPointX = () => {
        return this.state.anchorPointX;
    }
    getAnchorPointY = () => {
        return this.state.anchorPointY;
    }
    getCenter = () => {
        return {x:this.getCenterX(),y:this.getCenterY()}
    }
    getCenterX = () => {
        return this.state.x._value + this.props.width/2;
    }
    getCenterY = () => {
        return this.state.y._value + this.props.height/2;
    }
    moveTo = ({x:x, y:y, dur, easing:easing}) => {
        var ani = this.parallel([
            this.moveToX({x: x, dur: dur, easing: easing}),
            this.moveToY({y: y, dur: dur, easing: easing})
        ]);
        return ani;
    }
    moveToX = ({x:x, dur:dur, easing:easing}) => {
        var realx = this._convertShowToRealX(x);
        var ani = Animated.timing(this.state.x, {
            toValue: realx,
            duration: dur,
            easing: easing || this.defaultEasing
        });
        return ani;
    }
    moveToY = ({y:y, dur:dur, easing:easing}) => {
        var realy = this._convertShowToRealY(y);
        var ani = Animated.timing(this.state.y, {
            toValue: realy,
            duration: dur,
            easing: easing || this.defaultEasing
        });
        return ani;
    }
    rotateTo = ({angle:angle, dur:dur, easing:easing}) => {
        var ani = Animated.timing(this.state.rotate, {
            toValue: angle,
            duration: dur,
            easing: easing || this.defaultEasing
        });
        return ani;
    }
    fadeIn = ({dur:dur, easing:easing}) => {
        this.state.opacity.setValue(0);
        var ani = Animated.timing(this.state.opacity, {
            toValue: 1,
            duration: dur,
            easing: easing || this.defaultEasing
        });
        return ani;
    }
    fadeOut = ({dur:dur, easing:easing}) => {
        this.state.opacity.setValue(1);
        var ani = Animated.timing(this.state.opacity, {
            toValue: 0,
            duration: dur,
            easing: easing || this.defaultEasing
        });
        return ani;
    }
    scalexTo = ({scaleX:scaleX, dur:dur, from:from, easing:easing}) => {
        if (from != null) {
            this.state.scaleX.setValue(from);
        }
        var ani = Animated.timing(this.state.scaleX, {
            toValue: scaleX,
            duration: dur,
            easing: easing || this.defaultEasing
        });
        return ani;
    }
    scaleyTo = ({scaleY:scaleY, dur:dur, from:from, easing:easing}) => {
        if (from != null) {
            this.state.scaleY.setValue(from);
        }
        var ani = Animated.timing(this.state.scaleY, {
            toValue: scaleY,
            duration: dur,
            easing: easing || this.defaultEasing
        });
        return ani;
    }
    scaleTo = ({scaleX:scaleX, scaleY:scaleY, dur:dur, from:from, easing:easing}) => {
        var ani = this.parallel([
            this.scalexTo({scaleX: scaleX, dur: dur, from: from ? from.x : null, easing: easing}),
            this.scaleyTo({scaleY: scaleY, dur: dur, from: from ? from.y : null, easing: easing})
        ]);
        return ani;
    }
    parallel = (aniAry) => {
        var count = aniAry.length;
        if (count < 1) {
            return null;
        }
        var ani = Animated.parallel(aniAry);
        return ani;
    }
    sequence = (aniAry) => {
        var count = aniAry.length;
        if (count < 1) {
            return null;
        }
        var ani = Animated.sequence(aniAry);
        return ani;
    }
    stop = () => {
        if (this.curAni) {
            this.curAni.reset();
            this.curAni = null;
        }
    }
    runRotateLoop = (dur, finish, loop = 1) => {
        this.state.rotate.setValue(this.initValue.rotate);
        this.curAni = this.rotateTo({angle: 360, dur: dur});
        this.curAni.start((value)=> {
            if (loop == 0 && value.finished) {
                this.runRotateLoop(dur, finish, loop);
            } else {
                loop = loop - 1;
                if (loop > 0 && value.finished) {
                    this.runRotateLoop(dur, finish, loop);
                } else {
                    if (finish) {
                        finish(this.props.tag, value.finished)
                    }
                    this.curAni = null;
                }
            }
        })
    }
    run = (ani, finish) => {
        this.curAni = ani.start((value)=> {
            if (finish) {
                finish(this.props.tag, value.finished)
            }
            this.curAni = null;
        })
    }
    runParallel = (aniAry, finish) => {
        this.curAni = Animated.parallel(aniAry);
        this.curAni.start((value)=> {
            if (finish) {
                finish(this.props.tag, value.finished)
            }
            this.curAni = null;
        });
    }
    runSequence = (aniAry, finish, loop = 1) => {
        this.curAni = Animated.sequence(aniAry);
        this.curAni.start((value)=> {
            if (loop == 0 && value.finished) {
                this.runSequence(aniAry, finish, loop);
            } else {
                loop = loop - 1;
                if (loop > 0 && value.finished) {
                    this.runSequence(aniAry, finish, loop);
                } else {
                    if (finish) {
                        finish(this.props.tag, value.finished)
                    }
                    this.curAni = null;
                }
            }

        });
    }

    render() {
        if (this.state.visible == false) {
            return null
        }
        var hitBoxStyle = null;
        if (this.props.showHitBox) {
            hitBoxStyle = {
                borderWidth: 1,
                borderColor: this.props.showHitBoxColor,
            }
        }
        return (
            <Animated.Image
                {...this._panResponder.panHandlers}
                ref={(ref)=> {
                    this.sprite = ref
                }}
                style={[hitBoxStyle, {
                    position: 'absolute',
                    zIndex: this.state.zIndex,
                    left: this.state.x,
                    top: this.state.y,
                    width: this.state.width,
                    height: this.state.height,
                    opacity: this.state.opacity,
                    transform: [
                        {translateY: (this.state.anchorPointY - 0.5) * this.initValue.height},
                        {translateX: (this.state.anchorPointX - 0.5) * this.initValue.width},
                        {scaleX: this.state.scaleX},
                        {scaleY: this.state.scaleY},
                        {
                            rotate: this.state.rotate.interpolate({
                                inputRange: [0, 360],
                                outputRange: ['0deg', '360deg'],
                            })
                        },
                        {translateY: -(this.state.anchorPointY - 0.5) * this.initValue.height},
                        {translateX: -(this.state.anchorPointX - 0.5) * this.initValue.width},
                    ]
                }]}
                source={this.props.source}
                resizeMode={this.props.resizeModel}
            >

            </Animated.Image>
        )
    }
}