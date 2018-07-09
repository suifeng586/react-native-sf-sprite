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
    PanResponder,
    ART

} from 'react-native'
import SFDrawLine from "./SFDrawLine"
import SFDrawPath from "./SFDrawPath"
import PropTypes from 'prop-types'
const {Surface, Shape, Path, Group} = ART;
const {width, height} = Dimensions.get('window')


export default class SFDrawLayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible:true
        };
    }
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        x: PropTypes.number,
        y: PropTypes.number,
    }
    static defaultProps = {
        width: width,
        height: height,
        x: 0,
        y: 0,
    }
    /**
     * 获取线的k,b系数
     */
    getLineKB = (p1, p2) => {
        if (p1.x == p2.x)
            return 0;
        var k, b;
        k = (p2.y - p1.y) / (p2.x - p1.x)
        b = p1.y - (p1.x * (p2.y - p1.y) / (p2.x - p1.x))
        if (p1.y == p2.y)
            k = 0;
        return {k: k, b: b}
    }
    /**
     * 根据线上两个点p1,p2已经圆心p3、半径r获取直线与圆的两个交点
     */
    getPointByLineAndCircle = (p1, p2, center, r) => {
        if (p1.x == p2.x && p1.y == p2.y) return null; //传入两个相同的点求不了
        var x1, y1, x2, y2;
        var m = center.x, n = center.y; // 圆心坐标m, n
        if (p1.x == p2.x){
            x1 = p1.x;
            x2 = p1.x;
            y1 = n - r;
            y2 = n + r;
        }else if (p1.y == p2.y){
            x1 = m - r;
            x2 = m + r;
            y1 = p1.y;
            y2 = p1.y;
        }else{
            var line = this.getLineKB(p1, p2);
            var k = line.k;
            var b = line.b;
            var A, B, C; // 转换一元二次方程Ax^2 + Bx + C = 0
            A = 1 + k * k;
            B = 2 * k * (b - n) - 2 * m;
            C = m * m + (b - n) * (b - n) - r * r;
            x1 = (-B + Math.sqrt(Math.pow(B, 2) - 4 * A * C)) / (2 * A);
            y1 = k * x1 + b;
            x2 = (-B - Math.sqrt(Math.pow(B, 2) - 4 * A * C)) / (2 * A);
            y2 = k * x2 + b;
        }

        var point1 = {}, point2 = {};
        point1.x = x1;
        point1.y = y1;
        point2.x = x2;
        point2.y = y2;

        return {p1:point1, p2:point2}

    }
    setVisible = (value) => {
        this.setState({visible:value})
    }
    setLineVisible = (value) => {
        this.refs.line.setVisible(value);
    }
    setPathVisible = (value) => {
        this.refs.path.setVisible(value);
    }
    /**
     * 画线段
     */
    drawLine = (p1, p2, color, size) => {
        this.refs.line.draw(p1, p2, color, size);
    }
    /**
     * 画连续线起始
     */
    drawPathBegin = (color, size) => {
        this.refs.path.drawBegin(color, size);
    }
    /**
     * 画连续的线
     */
    drawPath = (p) => {
        this.refs.path.draw(p);
    }

    render() {
        return (
            <Surface style={{
                position:'absolute',
                left:this.props.x,
                right:this.props.y
            }} width={this.props.width} height={this.props.height}>
                <SFDrawLine ref="line"/>
                <SFDrawPath ref="path"/>
            </Surface>
        )
    }
}