import React, {Component} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from "./components/Home";
import Footers from "./components/Footers";

// import idsList from '../src/data/vadis_app_ssoar_list.json';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            ssoar_ids_list: {},
            vadis_app_ssoar_list_endpoint: 'https://demo-vadis.gesis.org/ssoar_list'
        }
        this.getParams=this.getParams.bind(this)
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

    getParams(id) {
        this.setState({
            id: id,
        })
        if (id && id !== 'null') {
            // window.open('http://localhost:3000/' + id, '_blank')
            window.open('https://demo-vadis.gesis.org:443/' + id, '_blank')
        }
        else{
            // window.open('http://localhost:3000/', '_self')
            window.open('https://demo-vadis.gesis.org:443/', '_self')
        }
    }

    render() {
        return (
            <div className="container">
                <Header/>
                <BrowserRouter>
                    <div>
                        <Routes>
                            <Route path="/" element={'ids' in this.state.ssoar_ids_list && this.state.ssoar_ids_list['ids'].length !== 0 ?
                                            <Home idsList={this.state.ssoar_ids_list['ids']} getParams={this.getParams}/>
                                            :
                                            null}/>
                            <Route path="/:id" element={<Home getParams={this.getParams}/>}/>
                        </Routes>
                    </div>
                </BrowserRouter>
                <div className='row footers'>
                    <Footers/>
                </div>
            </div>
        );
    }
}

export default App;
