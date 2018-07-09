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
const {width, height} = Dimensions.get('window')


export default class SFDrawLine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible:true,
            shapeAry:[],
            blnUpdate:false,
        };
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
    setVisible = (value) => {
        this.setState({visible:value})
    }
    draw = (p1,p2,color,size) => {
        const path = Path();
        path.moveTo(p1.x,p1.y); //将起始点移动到(1,1) 默认(0,0)
        path.lineTo(p2.x,p2.y); //连线到目标点(300,1)
        this.addShape(path,color,size);
        this.setUpdate();
    }

    addShape = (path,color,size) => {
        var shape = {}
        shape.path = path;
        shape.color = color;
        shape.size = size;
        this.state.shapeAry.push(shape);
    }
    render_shapes = () => {
        var shapes = [];
        for (var i = 0; i < this.state.shapeAry.length; i++){
            var shapeData = this.state.shapeAry[i];
            shapes.push(
                <Shape key={i} d={shapeData.path} stroke={shapeData.color} strokeWidth={shapeData.size}/>
            )
        }
        console.log(shapes);
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