import {Component} from "react";
import './styles/Header.sass'
import vadis from '../images/vadis.PNG'

class Header extends Component {
    render() {
        return <div className="row header">
            <img src={vadis} alt="vadis"/>
        </div>;
    }
}

export default Header;