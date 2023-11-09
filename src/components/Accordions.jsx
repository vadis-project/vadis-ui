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
// import Slider from "./Slider";
import Highlighter from "react-highlight-words";
import ShowMoreText from "react-show-more-text";
import Icon from "./Icon";

class Accordions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            range_values: [],
            sentences_within_range_count: [],
            highlightFlag: false
        };

        this.handleChange = this.handleChange.bind(this)
        this.toggleHighlighting = this.toggleHighlighting.bind(this)
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
            if (!res[0].includes('summary')) {
                rv.push([0.75, 1.0])
                let c = 0
                Object.entries(this.props.result[res[0]]).forEach((k, i) => {
                    if (Number(k[1]['score']) >= rv[res_ind][0] && Number(k[1]['score']) <= rv[res_ind][1]) {
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

    toggleHighlighting() {
        this.setState({
            highlightFlag: !this.state.highlightFlag
        })
    }

    render() {
        let {range_values, sentences_within_range_count} = this.state
        return (
            range_values.length !== 0 ?
                Object.entries(this.props.result).map((key_val, key_val_ind) => (
                    Array.isArray(key_val[1]) && key_val[1].length !== 0 ?
                        <Accordion key={key_val_ind} className='row' allowMultipleExpanded allowZeroExpanded
                                   preExpanded={[key_val_ind]}>
                            <AccordionItem key={key_val_ind} className='col-lg-12 accord-margin' uuid={key_val_ind}>
                                <br/>
                                <AccordionItemHeading>
                                    <AccordionItemButton className='accordion__button'>
                                        <>
                                            <span
                                                id={key_val[0]}>{key_val[0].includes('variable_sentences') ? 'Variable Sentences' : key_val[0]}
                                            </span>
                                            <ReactTooltip anchorId={key_val[0]}
                                                          place="top"
                                                          className="tooltip-clr"
                                                          content="Automatically selected sentences from the publication, which mention variables"
                                            />
                                            <b id='variable-sentences-count'> ({sentences_within_range_count[key_val_ind]}) </b>
                                            <ReactTooltip
                                                anchorId='variable-sentences-count'
                                                place="top"
                                                className="tooltip-clr"
                                                content="Amount of extracted sentences containing linked variables with high precision"/>
                                            <div className="form-check form-switch switch-btn"
                                                 onClick={event => event.stopPropagation()}>
                                                <input className="form-check-input" type="checkbox" role="switch"
                                                       id="flexSwitchCheckChecked"
                                                       onChange={() => this.toggleHighlighting()}/>
                                                <label className="form-check-label" id='highlight-tooltip'
                                                       htmlFor="flexSwitchCheckChecked">
                                                    Common words highlighting
                                                    {/*{!this.state.highlightFlag?'Toggle to highlight common words':'Toggle to unhighlight common words'}*/}
                                                </label>
                                                <ReactTooltip
                                                    anchorId='highlight-tooltip'
                                                    place="top"
                                                    className="tooltip-clr"
                                                    content="Toggle to (un)highlight the common words"/>
                                            </div>
                                        </>
                                    </AccordionItemButton>
                                </AccordionItemHeading>
                                {/*<br/>*/}
                                <AccordionItemPanel className='panel-bg-clr'>
                                    {
                                        key_val[1].map((var_sent, var_sent_ind) => (
                                            typeof var_sent === 'object' && Object.keys(var_sent).length !== 0 ?
                                                <Accordion key={String(key_val_ind) + String(var_sent_ind)}
                                                           className='row r-margin' allowMultipleExpanded
                                                           allowZeroExpanded>
                                                    {
                                                        'score' in var_sent && Number(var_sent['score']) >= range_values[key_val_ind][0] && Number(var_sent['score']) <= range_values[key_val_ind][1] ?
                                                            <AccordionItem
                                                                key={String(key_val_ind) + String(var_sent_ind)}
                                                                className='col-12'>
                                                                <AccordionItemHeading>
                                                                    <AccordionItemButton
                                                                        className={var_sent_ind % 2 !== 0 ? 'accordion__button' : 'accordion__button accordion-item-clr'}>
                                                                        <span>
                                                                            {'common_words' in var_sent && var_sent['common_words'].length !== 0 && this.state.highlightFlag ?
                                                                                <Highlighter
                                                                                    highlightClassName="highlight"
                                                                                    searchWords={var_sent['common_words']}
                                                                                    autoEscape={true}
                                                                                    textToHighlight={var_sent['sentence']}
                                                                                />
                                                                                :
                                                                                var_sent['sentence']
                                                                            }
                                                                        </span>
                                                                        {
                                                                            'score' in var_sent ?
                                                                                <>
                                                                                    &nbsp;&nbsp;<span>
                                                                                (<i id={"var_score" + String(key_val_ind) + String(var_sent_ind)}
                                                                                    className='orange-clr'>
                                                                                    score:
                                                                                </i> {var_sent['score']})
                                                                            </span>
                                                                                    <ReactTooltip
                                                                                        anchorId={"var_score" + String(key_val_ind) + String(var_sent_ind)}
                                                                                        place="top"
                                                                                        // variant="info"
                                                                                        className="tooltip-clr"
                                                                                        // float={true}
                                                                                        content="Sentence confidence to contain a variable"/>
                                                                                </>
                                                                                : null
                                                                        }
                                                                        <span className='copy-icon'
                                                                              id={String(key_val_ind) + String(var_sent_ind)}
                                                                              onClick={async () => {
                                                                                  await navigator.clipboard.writeText(var_sent['sentence'].toString());
                                                                                  window.open('https://demo-vadis.gesis.org:443/_pdf/' + this.props.pdfId + '.pdf#search="' + var_sent['sentence'] + '"', '_blank');
                                                                                  // var_content[1].substring(0,25) //#search="text..." Individual parameters, together with their values (separated by & or #), can be no greater than 32 characters in length.

                                                                              }}
                                                                        >
                                                                        <Icon iconName='CopyAndOpenPdf'/>
                                                                        <ReactTooltip
                                                                            anchorId={String(key_val_ind) + String(var_sent_ind)}
                                                                            place="top"
                                                                            // variant="info"
                                                                            className="sentence-tooltip-style tooltip-clr"
                                                                            // float={true}
                                                                        >
                                                                            <ol className='row'>
                                                                                <span>Click to copy this sentence and open the PDF in new tab to search for the copied sentence. Nextly, press following buttons in sequence to find the occurrence:</span>
                                                                                <li className='col-6'>
                                                                                    <b>Ctrl + F </b>(to open finder window)
                                                                                </li>
                                                                                <li className='col-6'>
                                                                                    <b>Ctrl + V </b>(to paste & jump to the occurrence)
                                                                                </li>
                                                                            </ol>
                                                                        </ReactTooltip>
                                                                </span>
                                                                    </AccordionItemButton>
                                                                </AccordionItemHeading>
                                                                <AccordionItemPanel
                                                                    className='panel-bg-clr accord-margin'>
                                                                    <Accordion
                                                                        key={'content' + String(key_val_ind) + String(var_sent_ind)}
                                                                        className='row r-margin'>
                                                                        {
                                                                            'variables' in var_sent && var_sent['variables'].length !== 0 ?
                                                                                var_sent['variables'].map((var_content, var_content_ind) =>
                                                                                    <AccordionItem
                                                                                        key={String(key_val_ind) + String(var_sent_ind) + String(var_content_ind)}
                                                                                        className='col-12 accord-margin'>
                                                                                        {
                                                                                            <>
                                                                                                <span>
                                                                                                    <a id={var_content['var_id'] + String(key_val_ind) + String(var_sent_ind)}
                                                                                                       className='bg-color'
                                                                                                       href={var_content['var_id'].includes('exploredata-') ? 'https://search.gesis.org/variables/' + var_content['var_id'] : null}
                                                                                                       target='_blank'
                                                                                                       rel='noreferrer'>
                                                                                                        <b>{var_content['var_id'] + ':'}</b>
                                                                                                    </a> &nbsp;{var_content['var_text']}
                                                                                                </span>
                                                                                                <ReactTooltip
                                                                                                    anchorId={var_content['var_id'] + String(key_val_ind) + String(var_sent_ind)}
                                                                                                    place="top"
                                                                                                    className="tooltip-clr"
                                                                                                    content="Click on variable ID for details"/>
                                                                                            </>
                                                                                        }
                                                                                    </AccordionItem>
                                                                                )
                                                                                : null
                                                                        }
                                                                        {
                                                                            'similar_variables' in var_sent && var_sent['similar_variables'].length !== 0 ?
                                                                                <AccordionItem>
                                                                                    <>
                                                                                        <b id={'similar_vars' + String(var_sent_ind)}
                                                                                           className='orange-clr inline-div'>
                                                                                            {'similar variables' + ': '}
                                                                                        </b>
                                                                                        <ShowMoreText lines={1}
                                                                                                      more={<span className='orange-clr'>Show More</span>}
                                                                                                      less={<span className='orange-clr'>Show less</span>}
                                                                                                      className="orange-clr inline-div"
                                                                                                      expanded={false}
                                                                                                      width={1800}
                                                                                                      truncatedEndingComponent={"... "}
                                                                                                      anchorClass='show-more-less-clickable bg-color'>
                                                                                            {var_sent['similar_variables'].map((v, v_ind) => {
                                                                                                return <span>
                                                                                                        &nbsp;
                                                                                                    <a className='bg-color'
                                                                                                    href={v.includes('exploredata-') ? 'https://search.gesis.org/variables/' + v : null}
                                                                                                    target='_blank'
                                                                                                    rel='noreferrer'>
                                                                                                        {v}
                                                                                                    </a>&nbsp;
                                                                                                </span>
                                                                                            })}
                                                                                        </ShowMoreText>
                                                                                        <ReactTooltip
                                                                                            anchorId={'similar_vars' + String(var_sent_ind)}
                                                                                            place="top"
                                                                                            className="tooltip-clr"
                                                                                            content="Additional related variables"/>

                                                                                    </>
                                                                                </AccordionItem>
                                                                                : null
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
                                <div className="d-flex justify-content-center">
                                    <button type="button" className="btn btn-link bg-color"
                                            disabled={range_values[2][0] <= 0.5 || sentences_within_range_count[key_val_ind] === key_val[1].length}
                                            onClick={() => range_values[2][0] > 0.5 ? this.handleChange([Number((range_values[2][0]-0.25).toFixed(1)), 1.0], key_val[0], key_val_ind) : null}> Show more sentences
                                    </button>
                                </div>
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