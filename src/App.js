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
        this.getId=this.getId.bind(this)
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

    getId(id) {
        this.setState({
            id: id,
        })
        if (id && id !== 'null') {
            window.open('http://localhost:3000/' + id, '_blank')
            // console.log(id)
        }
        else{
            window.open('http://localhost:3000/', '_self')
        }
        // else if (id && id !== 'null') {
        //     window.open('http://localhost:3000/' + index + '/' + id, '_blank')
        // } else {
        //     window.open('http://localhost:3000/', '_blank')
        // }
        // if (field && field !== 'null') {
        //     window.open('https://demo-outcite.gesis.org:443/' + index + '/' + id + '/' + field, '_blank')
        // } else if (id && id !== 'null') {
        //     window.open('https://demo-outcite.gesis.org:443/' + index + '/' + id, '_blank')
        // } else {
        //     window.open('https://demo-outcite.gesis.org:443/', '_blank')
        // }


    }

    render() {
        // console.log(this.state._id)
        return (
            <div className="container">
                <Header/>
                <BrowserRouter>
                    <div>
                        <Routes>
                            <Route path="/" element={
                                    // {
                                        'ids' in this.state.ssoar_ids_list && this.state.ssoar_ids_list['ids'].length !== 0 ?
                                            <Home idsList={this.state.ssoar_ids_list['ids']} getId={this.getId}/>
                                            :
                                            null
                                    // }
                                    // <div className='row footers'>
                                    //     <Footers/>
                                    // </div>
                            }
                            />
                            <Route path="/:id" element={<Home getId={this.getId}/>}/>
                            {/*<Route path="/:index/:id" element={<><Header showHomeBtn/><Results/></>}/>*/}
                            {/*<Route path="/:index/:id/:includes_field" element={<><Header showHomeBtn/><Results/></>}/>*/}
                        </Routes>
                    </div>
                </BrowserRouter>
                <div className='row footers'>
                    <Footers/>
                </div>
                {/*<Header/>*/}
                {/*{'ids' in this.state.ssoar_ids_list && this.state.ssoar_ids_list['ids'].length!==0?<Home idsList={this.state.ssoar_ids_list['ids']}/>:null}*/}
                {/*<div className='row footers'>*/}
                {/*    <Footers/>*/}
                {/*</div>*/}
            </div>
        );
    }
}

export default App;
