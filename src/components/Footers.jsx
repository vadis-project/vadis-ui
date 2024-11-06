import React from 'react';
import './styles/Footers.sass'
import Footer from 'rc-footer';
import 'rc-footer/assets/index.css';
import { ReactComponent as GesisSvgIcon } from '../images/logo_gesis_en.svg';
import Dfg from "../images/dfg.jfif";
// import 'rc-footer/asssets/index.less';

export default function Footers() {
    return (
        <div>
            <Footer
                // backgroundColor='#B3D8F2'
                theme='light'
                columns={[
                    {
                        // style: {divStyle},
                        title: 'GESIS',
                        items: [
                            {
                                title: (
                                    <a href="https://www.gesis.org/en/home" target="_blank" rel="noopener noreferrer">
                                        <GesisSvgIcon style={{ height: '50px', maxWidth:'150px' }} />
                                    </a>
                                )
                            },
                            {
                                title: 'Imprint',
                                url: 'https://www.gesis.org/en/institute/imprint',
                                openExternal: true,
                            },
                        ],
                    },
                    {
                        title: 'Funding',
                        items: [
                            {
                                title: (
                                    <a href="https://www.dfg.de/en" target="_blank" rel="noopener noreferrer">
                                        <img src={Dfg} alt="Dfg" style={{height: '100px', maxWidth:'170px', verticalAlign: 'middle'}}/>
                                    </a>
                                )
                            },
                        ],
                    },
                    {
                        title: 'Contact us',
                        items: [
                            {
                                title: 'Project Website',
                                url: 'https://vadis-project.github.io/',
                                openExternal: true,
                            },
                            {
                                title: 'E-mail',
                                description: 'ahsan.shahid@gesis.org',
                            },
                        ],
                    },
                ]}
                 // bottom="© GESIS"
            />
        </div>
    );
}
