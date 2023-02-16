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
            <RangeSlider id="range-slider-orange" key={this.props.ind} min={this.props.min} max={this.props.max} step={this.props.step? this.props.step:null}
                         // className="single-thumb"
                         defaultValue={this.props.defaultValue}
                         onInput={(event)=>this.props.handleChange(event, this.props.obj_key, this.props.ind)}
            />
            </>
        )
    }
}

export default Slider;