import React, {Component} from 'react';
import './App.css';
import Header from './components/Header';
import Home from "./components/Home";
import Footers from "./components/Footers";

class App extends Component {
  // constructor(props) {
  //   super(props);
  // }


  render() {
    return (
        <div className="container">
            <Header/>
            <Home/>
            <div className='row footers'>
                <Footers/>
            </div>
        </div>
    );
  }
}

export default App;
