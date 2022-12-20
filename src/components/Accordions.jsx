import React, {Component} from 'react';
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';
// Demo styles, see 'Styles' section below for some notes on use.
import 'react-accessible-accordion/dist/fancy-example.css';
import './styles/Accordions.sass'
import './styles/Icon.sass'
import Icon from "./Icon";

let range_value = 2; // set global variable due to recursive call of the component, and it changes state to initial value on each call

class Accordions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            range_changed: false,
        };

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event) {
        this.setState({range_changed: !this.state.range_changed});
        range_value = Number(event.target.value)
    }

    render() {
        return (
            <Accordion className={this.props.children ? 'row r-margin' : 'row'} allowMultipleExpanded allowZeroExpanded>
                {
                    Object.entries(this.props.result).map((res, res_ind) => (
                            // typeof res[1] === 'string' || res[1] instanceof String?
                            typeof res[1] === 'string' || res[1] instanceof String || !isNaN(res[1]) ?
                                // res[0] !== 'score' ?
                                <AccordionItem className='col-12 txt-margin' key={res_ind}>
                                    {res[0] === 'summary' ?
                                        <span>
                                            <b className='bg-color'>{res[0] + ': '}</b>{res[1]}<br/>
                                            {/*   <a className='btn dropdown-toggle rt-icon bg-color'*/}
                                            {/*      id="dropdownFilter" data-bs-toggle="dropdown" aria-expanded="false"*/}
                                            {/*      // href='https://demo-vadis.gesis.org:443/'*/}
                                            {/*      rel='noreferrer'><Icon iconName='Filter' size='lg'/>*/}
                                            {/*   </a>*/}
                                            </span>
                                        :
                                        <span>
                                            <b className='bg-color'>{res[0] + ': '}</b>{res[1]}
                                            </span>
                                    }
                                </AccordionItem>
                                :
                                typeof res[1] === 'object' && Object.keys(res[1]).length !== 0 && !Array.isArray(res[1]) && res[1] !== null ?
                                    !('score' in res[1]) || ('score' in res[1] && Number(res[1]['score']) <= range_value) ?
                                        <AccordionItem className='col-12' key={res_ind}>
                                            {/*{!('score' in res[1])?*/}
                                            {/*    <span className="range-clr rt-icon">*/}
                                            {/*        <label htmlFor="score">Slide to filter sentences by score (Min: 0, Max: 2, Current: {range_value})</label> &nbsp;*/}
                                            {/*        <input type="range" id="score" name="score" min="0" max="2" step="0.5"*/}
                                            {/*               defaultValue={range_value} onChange={this.handleChange}/>*/}
                                            {/*        /!*<output>{range_value}</output>*!/*/}
                                            {/*    </span>*/}
                                            {/*    :*/}
                                            {/*    null*/}
                                            {/*}*/}
                                            <AccordionItemHeading>
                                                <AccordionItemButton className='accordion__button'>
                                                    {res[0]}
                                                </AccordionItemButton>
                                            </AccordionItemHeading>
                                            <AccordionItemPanel className='panel-bg-clr'>
                                                <Accordions result={res[1]} children/>
                                            </AccordionItemPanel>
                                        </AccordionItem>
                                        :
                                        null
                                    :
                                    null
                        )
                    )
                }
            </Accordion>
        );
    }
}

export default Accordions;