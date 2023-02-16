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
import Highlighter from "react-highlight-words";

class Accordions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            range_values: [],
            sentences_within_range_count: []
        };

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event, obj_key, ind) {
        let sentences_within_range_c = 0
        let count_within_range = this.state.sentences_within_range_count
        let range_v = this.state.range_values
        range_v[ind] = event
        Object.entries(this.props.result[obj_key]).forEach((k, i) => {
            if (k[1]['score'] >= range_v[ind][0] && k[1]['score'] <= range_v[ind][1]) {
                sentences_within_range_c += 1
            }
        })
        count_within_range[ind] = sentences_within_range_c
        this.setState({
            range_values: range_v,
            sentences_within_range_count: count_within_range

        });
    }

    componentDidMount() {
        let sentences_within_range_c = []
        let rv= []
        Object.entries(this.props.result).map((res, res_ind) => {
            if (res[0]!=='summary') {
                rv.push([1.0, 2.0])
                let c = 0
                Object.entries(this.props.result[res[0]]).forEach((k, i) => {
                    // console.log(k, rv[res_ind])
                    if (k[1]['score'] >= rv[res_ind][0] && k[1]['score'] <= rv[res_ind][1]) {
                        c += 1
                    }
                })
                sentences_within_range_c.push(c)
            }
            else{
                // pushing 0's if key==='summary' to keep the list index in an order
                rv.push([0,0])
                sentences_within_range_c.push(0)
            }
        })
        this.setState({
            range_values: rv,
            sentences_within_range_count: sentences_within_range_c
        })
    }

    render() {
        // onClick={()=>window.find('source')}
        let {range_values, sentences_within_range_count}= this.state
        return (
            range_values.length!==0 ?
                Object.entries(this.props.result).map((var_sentences, var_sentences_ind) => (
                typeof var_sentences[1] === 'object' && Object.keys(var_sentences[1]).length !== 0 ?
                    // var_sentences[0] !== 'summary' ?
                        <Accordion key={var_sentences_ind} className='row' allowMultipleExpanded allowZeroExpanded>
                            <AccordionItem key={var_sentences_ind} className='col-12 accord-margin'>
                                <span className="rt-pos">
                                    <Slider ind={var_sentences_ind}
                                            label={<span>Slide to filter sentences by score (Selected Range: <b> {(range_values[var_sentences_ind].toString())}</b>)</span>}
                                            min={0} max={3}
                                            step={0.1} defaultValue={range_values[var_sentences_ind]}
                                            obj_key={var_sentences[0]}
                                            handleChange={this.handleChange}/>
                                </span>
                                <AccordionItemHeading>
                                    <AccordionItemButton className='accordion__button'>
                                        <>
                                            <span id={var_sentences[0]}>{var_sentences[0].includes('variable_sentences')? 'Linked Variable Sentences' : var_sentences[0]}
                                                <b> ({sentences_within_range_count[var_sentences_ind]}) </b>
                                            </span>
                                            <ReactTooltip anchorId={var_sentences[0]}
                                                          place="top"
                                                          variant="info"
                                                          // float={true}
                                                          content={var_sentences[0]}/>
                                        </>
                                    </AccordionItemButton>
                                </AccordionItemHeading>
                                <AccordionItemPanel className='panel-bg-clr'>
                                    {
                                        Object.entries(var_sentences[1]).map((var_sent, var_sent_ind) => (
                                            typeof var_sent[1] === 'object' && Object.keys(var_sent[1]).length !== 0 ?
                                                <Accordion key={var_sentences_ind + var_sent_ind} className='row r-margin' allowMultipleExpanded allowZeroExpanded>
                                                    {
                                                        'score' in var_sent[1] && Number(var_sent[1]['score']) >= range_values[var_sentences_ind][0] && Number(var_sent[1]['score']) <= range_values[var_sentences_ind][1]?
                                                        <AccordionItem key={var_sentences_ind + var_sent_ind} className='col-12'>
                                                        <AccordionItemHeading>
                                                            <AccordionItemButton className='accordion__button'>
                                                                {'common_words' in var_sent[1] && var_sent[1]['common_words'].length!==0?
                                                                    <Highlighter
                                                                        highlightClassName="highlight"
                                                                        searchWords={var_sent[1]['common_words']}
                                                                        autoEscape={true}
                                                                        textToHighlight={var_sent[0]}
                                                                    />
                                                                    :
                                                                    var_sent[0]
                                                                }
                                                            </AccordionItemButton>
                                                        </AccordionItemHeading>
                                                        <AccordionItemPanel className='panel-bg-clr accord-margin'>
                                                            <Accordion key={'content' + var_sentences_ind + var_sent_ind} className='row r-margin'>
                                                                {
                                                                    Object.entries(var_sent[1]).map((var_content, var_content_ind) => (
                                                                        <AccordionItem key={var_sentences_ind + var_sent_ind + var_content_ind} className='col-12 accord-margin'>
                                                                            {
                                                                                var_content[0] === 'score' ?
                                                                                    <>
                                                                                        <span>
                                                                                            <b id={"var_score" + var_sentences_ind + var_sent_ind}
                                                                                               className='orange-clr'>
                                                                                                {var_content[0] + ': '}
                                                                                            </b> {var_content[1]}
                                                                                        </span>
                                                                                        <ReactTooltip
                                                                                            anchorId={"var_score" + var_sentences_ind + var_sent_ind}
                                                                                            place="top"
                                                                                            variant="info"
                                                                                            // float={true}
                                                                                            content="Variable Score"/>
                                                                                    </>
                                                                                    : Array.isArray(var_content[1]) ?
                                                                                    // var_content[0] === 'common_words' ?
                                                                                        var_content[1].length !== 0 ?
                                                                                            <>
                                                                                                <span>
                                                                                                    <b id={"common_words" + var_content_ind + Date.now()}
                                                                                                   className='orange-clr'>{var_content[0] + ': '}</b>
                                                                                                    {var_content[1].join(', ')}
                                                                                                </span>
                                                                                                <ReactTooltip
                                                                                                    anchorId={"common_words" + var_content_ind + Date.now()}
                                                                                                    place="top"
                                                                                                    variant="info"
                                                                                                    // float={true}
                                                                                                    content="Highlighted Words"/>
                                                                                            </>
                                                                                            : null
                                                                                        :
                                                                                        <span>
                                                                                            <a className='bg-color'
                                                                                               href={var_content[0].includes('exploredata-') ? 'https://search.gesis.org/variables/' + var_content[0] : null}
                                                                                               target='_blank'
                                                                                               rel='noreferrer'>
                                                                                                <b>{var_content[0] + ': '}</b>
                                                                                            </a>
                                                                                           {'common_words' in var_sent[1] && var_sent[1]['common_words'].length !== 0 ?
                                                                                                    <Highlighter
                                                                                                        highlightClassName="highlight"
                                                                                                        searchWords={var_sent[1]['common_words']}
                                                                                                        autoEscape={true}
                                                                                                        textToHighlight={var_content[1]}/>
                                                                                                    :
                                                                                                    var_content[1]
                                                                                           }
                                                                                        </span>
                                                                            }
                                                                        </AccordionItem>
                                                                    ))
                                                                }
                                                            </Accordion>
                                                        </AccordionItemPanel>
                                                    </AccordionItem>
                                                            :
                                                            null
                                                    }
                                                </Accordion>
                                                :
                                                null
                                        ))
                                    }
                                </AccordionItemPanel>
                            </AccordionItem>
                        </Accordion>
                        :
                        null
                ))
                : null
        );
    }
}

export default Accordions;