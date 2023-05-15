import React, {Component} from "react";
import './styles/Icon.sass'
import {faFilter, faFilePdf, faPaste} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

class Icon extends Component {
    render() {
        return (
            this.props.iconName === "Filter" ?
                <FontAwesomeIcon className='icn-color pdng' icon={faFilter} size={this.props.size?this.props.size:'lg'}/>
                : this.props.iconName === "PDF" ?
                    <FontAwesomeIcon className='icn-color' icon={faFilePdf} size={this.props.size?this.props.size:'lg'}/>
                    : this.props.iconName === "CopyAndOpenPdf"?
                        <FontAwesomeIcon className='icn-color' icon={faPaste} size={this.props.size?this.props.size:'lg'}/>
                        : null
        )
    }
}

export default Icon;