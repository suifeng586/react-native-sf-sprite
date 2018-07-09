/**
 * Created by Joker on 2018-04-12.
 * react-native-swiper
 */
import React, {Component} from 'react'
import {
    Dimensions,
    Platform,
    ART

} from 'react-native'
const {Surface, Shape, Path, Group} = ART;
const {width, height} = Dimensions.get('window');


export default class SFDrawPath extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible:true,
            blnUpdate:false,
            shapeAry:[]
        };
        this.points = [];
    }
    setUpdate(){
        this.setState({
            blnUpdate: !this.state.blnUpdate,
        });
    }
    clean = () => {
        this.setState({
            shapeAry:[]
        })
    }
    drawBegin = (color,size) => {
        this.points = [];
        this.addShape(new Path(),color,size);
    }
    draw = (p) => {
        var lastPoint = this.points[this.points.length-1];
        if (lastPoint != null){
            if (Math.abs(lastPoint.x-p.x) > 5 || Math.abs(lastPoint.y-p.y) > 5){
                this.points.push(p);
            }else{

                return;
            }
        }else{
            this.points.push(p);
        }

        var paintPath = Path()
        for (var i = 0; i < this.points.length; i++){
            var p = this.points[i];
            if (i==0){
                paintPath.moveTo(p.x, p.y);
            }else{
                paintPath.lineTo(p.x, p.y);
            }
        }
        this.state.shapeAry[this.state.shapeAry.length - 1].path = paintPath;
        this.setUpdate();
    }
    setVisible = (value) => {
        this.setState({visible:value})
    }
    addShape = (path,color,size) => {
        var shape = {}
        shape.path = path;
        shape.color = color;
        shape.size = size;
        var tmp = this.state.shapeAry.concat();
        tmp.push(shape);
        this.setState({shapeAry:tmp});
    }
    render_shapes = () => {
        var shapes = [];
        for (var i = 0; i < this.state.shapeAry.length; i++){
            var shapeData = this.state.shapeAry[i];
            shapes.push(
                <Shape key={i} d={shapeData.path} stroke={shapeData.color} strokeWidth={shapeData.size}/>
            )
        }
        return shapes;
    }

    render() {
        if (this.state.visible == false) {
            return null
        }
        return (
            <Group>
                {this.render_shapes()}
            </Group>
        )
    }
}