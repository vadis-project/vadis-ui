import React, {Component} from "react";
import './styles/Slider.sass'
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
// import {faFilter} from "@fortawesome/free-solid-svg-icons";
// import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

class Slider extends Component {
    render() {
        return (
            <>
            <label className="label">{this.props.label}</label>
            <RangeSlider id="range-slider-orange" min={this.props.min} max={this.props.max} step={this.props.step? this.props.step:null}
                         className="single-thumb"
                         defaultValue={this.props.defaultValue}
                         onInput={(event)=>this.props.handleChange(event)}
                         // onRangeDragStart={(event)=>console.log(event)}
                         // onThumbDragEnd={()=>console.log('here')}
            />
            </>
            // <>
            //     <label htmlFor="score">{this.props.label}</label> &nbsp;
            //     <input type="range" id="score" name="score" min={this.props.min} max={this.props.max} step={this.props.step? this.props.step:null}
            //            defaultValue={this.props.defaultValue} onChange={(event)=>this.props.handleChange(event)}/>
            //     {/*<output>{range_value}</output>*/}
            // </>
        )
    }
}

export default Slider;