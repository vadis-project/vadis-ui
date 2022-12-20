import React, {Component} from "react";
import './styles/Icon.sass'
import {faFilter} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

class Icon extends Component {
    render() {
        return (
            this.props.iconName === "Filter" ?
                <FontAwesomeIcon icon={faFilter} size={this.props.size?this.props.size:'lg'}/>
                : null
        )
    }
}

export default Icon;