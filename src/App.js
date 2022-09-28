import React, {Component} from 'react';
import './App.css';
import Header from './components/Header';

class App extends Component {
  // constructor(props) {
  //   super(props);
  // }


  render() {
    return (
        <div className="container">
            <Header/>
        </div>
    );
  }
}

export default App;
