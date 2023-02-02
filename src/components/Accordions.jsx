import React, {Component} from 'react';
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';
import {Tooltip as ReactTooltip} from 'react-tooltip';
import "react-tooltip/dist/react-tooltip.css";
import 'react-accessible-accordion/dist/fancy-example.css';
import './styles/Accordions.sass'
import './styles/Icon.sass'
import Slider from "./Slider";

let range_value = [0.7, 1.3]; // set global variable due to recursive call of the component, and it changes state to initial value on each call

class Accordions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            range_changed: false,
        };

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event) {
        let sentences_within_range_c = 0
        this.setState({range_changed: !this.state.range_changed});
        range_value = event
        Object.entries(this.props.result['variable_sentences']).forEach((k, i) => {
            if (k[1]['score'] >= range_value[0] && k[1]['score'] <= range_value[1]) {
                sentences_within_range_c += 1
            }
        })
        this.setState({
            sentences_within_range_count: sentences_within_range_c
        })
    }

    componentDidMount() {
        let sentences_within_range_c = 0
        if ('variable_sentences' in this.props.result) {
            Object.entries(this.props.result['variable_sentences']).forEach((k, i) => {
                if (k[1]['score'] >= range_value[0] && k[1]['score'] <= range_value[1]) {
                    sentences_within_range_c += 1
                }
            })
        }
        this.setState({
            sentences_within_range_count: sentences_within_range_c
        })
    }

    render() {
        return (
            <Accordion className={this.props.children ? 'row r-margin' : 'row'} allowMultipleExpanded allowZeroExpanded>
                {
                    Object.entries(this.props.result).map((res, res_ind) => (
                            typeof res[1] === 'string' || res[1] instanceof String || !isNaN(res[1]) ?
                                <AccordionItem className='col-12 txt-margin' key={res_ind}>
                                    {res[0] === 'summary' ? null
                                        // <>
                                        //     <span>
                                        //         <b id={"summary"+res_ind} className='bg-color'>{res[0] + ': '}</b>{res[1]}<br/>
                                        //     </span>
                                        //     <ReactTooltip anchorId={"summary"+res_ind}
                                        //                   place="top"
                                        //                   variant="info"
                                        //                   float={true}
                                        //                   content="Auto generated summary"/>
                                        // </>
                                        : res[0] === 'score' ?
                                            <>
                                            <span>
                                            <b id={"var_score" + res[1]}
                                               className='orange-clr'>{res[0] + ': '}</b>{res[1]}
                                            </span>
                                                <ReactTooltip anchorId={"var_score" + res[1]}
                                                              place="top"
                                                              variant="info"
                                                              float={true}
                                                              content="Variable Score"/>
                                            </>
                                            : <span>
                                                <a className='bg-color'
                                                   href={'https://search.gesis.org/variables/' + res[0].split('--- ')[1]}
                                                   target='_blank'
                                                   rel='noreferrer'><b>{res[0] + ': '}</b>
                                                </a>{res[1]}
                                        </span>
                                    }
                                </AccordionItem>
                                :
                                typeof res[1] === 'object' && Object.keys(res[1]).length !== 0 && !Array.isArray(res[1]) && res[1] !== null ?
                                    !('score' in res[1]) || ('score' in res[1] && Number(res[1]['score']) >= range_value[0] && Number(res[1]['score']) <= range_value[1]) ?
                                        <AccordionItem className='col-12' key={res_ind}>
                                            {!('score' in res[1]) ?
                                                <span className="rt-pos">
                                                    <Slider label={<span>Slide to filter sentences by score (Selected Range: <b> {(range_value).toString()}</b>)</span>}
                                                            min={0} max={2}
                                                            step={0.1} defaultValue={range_value}
                                                            handleChange={this.handleChange}/>
                                                    {/*// <label htmlFor="score">Slide to filter sentences by score (Min: 0, Max: 2, Current: {range_value})</label> &nbsp;*/}
                                                    {/*// <input type="range" id="score" name="score" min="0" max="2" step="0.5"*/}
                                                    {/*//        defaultValue={range_value} onChange={this.handleChange}/>*/}
                                                    {/*// <output>{range_value}</output>*/}
                                                </span>
                                                :
                                                null
                                            }
                                            <AccordionItemHeading>
                                                <AccordionItemButton className='accordion__button'>
                                                    {res[0] === 'variable_sentences' ? <>
                                                            <span id={'variable_sents'}>{res[0]}
                                                                <b> ({this.state.sentences_within_range_count}) </b>
                                                            </span>
                                                            <ReactTooltip anchorId={'variable_sents'}
                                                                          place="top"
                                                                          variant="info"
                                                                          float={true}
                                                                          content="Linked variable sentences"/></>
                                                        : res[0]}
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