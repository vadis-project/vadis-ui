import {Component} from "react";
import './styles/Header.sass'
import vadis from '../images/vadis-logo.PNG'

class Header extends Component {
    render() {
        return <div className="row justify-content-center header">
            <img className='w-75' src={vadis} alt="vadis"/>
        </div>;
    }
}

export default Header;