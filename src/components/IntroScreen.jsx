import React, {Component} from 'react';
import './styles/IntroScreen.sass';
import vadisIntro from '../images/vadis-intro-4.PNG'
import vadisHome from "../images/vadis-home.png";


class IntroScreen extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <>
                <div className='row'>
                    <div className='card'>
                        <div className='row mgn-top'>
                            <p className='col-9 padding-text'>
                                Welcome to the search demo of the&nbsp;
                                <a className='bg-color'
                                   href='https://vadis-project.github.io/'
                                   target='_blank'
                                   rel='noreferrer'>
                                    <b>VADIS</b>
                                </a>
                                &nbsp;project (VAriable Detection, Interlinking and Summarization).
                                Starting with classical document search, it allows for searching and discovering survey variables in context of scholarly publications. The key idea of the VADIS project is to identify references to survey variables within the full text of research literature, creating semantic links based on these references and making the resulting data available.
                            </p>
                            <img className='col-3 img-home2' src={vadisHome} alt=''/>
                        </div>
                        <br/>
                        <div className='col-12 text-center'>
                            <b>Note: </b> <i className='text-bg-success'>&nbsp; Kindly go through the following image for better understanding before heading
                            to the live demo. Thank you and happy summer </i><span className='text-bg-success'>&#9728;</span>

                        </div>
                        <br/>
                        <img className='col-12 img-pointer' src={vadisIntro} alt='' onClick={() => window.open('https://demo-vadis.gesis.org/', '_blank')}/>
                        {/*<br/>*/}
                        <div className="d-flex justify-content-center">
                            <button type="button" className="btn btn-success"
                                    onClick={() => window.open('https://demo-vadis.gesis.org/', '_blank')}> Let's Go! <span className='flip-horizontal'>&#x1F3C3;&#x200D;&#x2642;&#xFE0F;</span>
                            </button>
                        </div>
                        <br/>
                    </div>
                </div>
            </>
        );
    }
}

export default IntroScreen;
