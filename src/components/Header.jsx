import {Component} from "react";
import './styles/Header.sass'
import vadis_logo from '../images/vadis-logo-1.png'

class Header extends Component {
    render() {
        return <div className="row justify-content-center header">
                <img className='img-header' src={vadis_logo} alt="vadis" onClick={()=>window.open("https://demo-vadis.gesis.org/", "_self")}/>
        </div>;
    }
}

export default Header;