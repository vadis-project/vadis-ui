import React from 'react';
import './styles/Footers.sass'
import Footer from 'rc-footer';
import 'rc-footer/assets/index.css';
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
                                title: 'Imprint',
                                url: 'https://www.gesis.org/en/institute/imprint',
                                openExternal: true,
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
