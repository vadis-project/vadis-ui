import React, {Component} from 'react';
import './App.css';
import Header from './components/Header';
import Home from "./components/Home";
import Footers from "./components/Footers";
// import idsList from '../src/data/vadis_app_ssoar_list.json';

class App extends Component {
  constructor(props) {
    super(props);
      this.state = {
          ssoar_ids_list: {},
          vadis_app_ssoar_list_endpoint: 'https://demo-vadis.gesis.org/ssoar_list'
      }
  }

    componentDidMount() {
        fetch(this.state.vadis_app_ssoar_list_endpoint)
            .then(response => response.json())
            .then(result => {
                this.setState({
                    ssoar_ids_list: result,
                })
            })
            .catch(error => console.log('error', error));
    }



  render() {
    return (
        <div className="container">
            <Header/>
            {'ids' in this.state.ssoar_ids_list && this.state.ssoar_ids_list['ids'].length!==0?<Home idsList={this.state.ssoar_ids_list['ids']}/>:null}
            <div className='row footers'>
                <Footers/>
            </div>
        </div>
    );
  }
}

export default App;
