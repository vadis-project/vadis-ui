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
            sentences_within_range_count: []
        };

        this.handleChange = this.handleChange.bind(this)
        // this.searchInPdf = this.searchInPdf.bind(this)
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
                rv.push([0.8, 1.0])
                let c = 0
                Object.entries(this.props.result[res[0]]).forEach((k, i) => {
                    // console.log(k, rv[res_ind])
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

    render() {
        let {range_values, sentences_within_range_count}= this.state
        return (
            range_values.length!==0 ?
                Object.entries(this.props.result).map((var_sentences, var_sentences_ind) => (
                typeof var_sentences[1] === 'object' && Object.keys(var_sentences[1]).length !== 0 ?
                        <Accordion key={var_sentences_ind} className='row' allowMultipleExpanded allowZeroExpanded preExpanded={[var_sentences_ind]}>
                            <AccordionItem key={var_sentences_ind} className='col-12 accord-margin' uuid={var_sentences_ind}>
                                {/*<span className="rt-pos">*/}
                                {/*    <Slider ind={var_sentences_ind}*/}
                                {/*            label={<span>Slide to filter sentences by score (Selected Range: <b> {(range_values[var_sentences_ind].toString())}</b>)</span>}*/}
                                {/*            min={0} max={1}*/}
                                {/*            step={0.1} defaultValue={range_values[var_sentences_ind]}*/}
                                {/*            obj_key={var_sentences[0]}*/}
                                {/*            handleChange={this.handleChange}/>*/}
                                {/*</span>*/}
                                <AccordionItemHeading>
                                    <AccordionItemButton className='accordion__button'>
                                        <>
                                            <span id={var_sentences[0]}>{var_sentences[0].includes('variable_sentences')? 'Linked Variable Sentences' : var_sentences[0]}
                                                <b> ({sentences_within_range_count[var_sentences_ind]}) </b>
                                            </span>
                                            <ReactTooltip anchorId={var_sentences[0]}
                                                          place="top"
                                                          // variant="info"
                                                          className="tooltip-clr"
                                                          // float={true}
                                                          content="Variable sentences list"
                                                          // content={var_sentences[0]}
                                            />
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
                                                            <AccordionItemButton className={var_sent_ind%2!==0?'accordion__button': 'accordion__button accordion-item-clr'}>
                                                                <span>
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
                                                                </span>
                                                                {
                                                                    'score' in var_sent[1]?
                                                                        <>
                                                                           &nbsp;&nbsp;<span>
                                                                                (<i id={"var_score" + var_sentences_ind + var_sent_ind}
                                                                                   className='orange-clr'>
                                                                                    score:
                                                                                </i> {var_sent[1]['score']})
                                                                            </span>
                                                                            <ReactTooltip
                                                                                anchorId={"var_score" + var_sentences_ind + var_sent_ind}
                                                                                place="top"
                                                                                // variant="info"
                                                                                className="tooltip-clr"
                                                                                // float={true}
                                                                                content="Sentence confidence to contain a variable"/>
                                                                        </>
                                                                        : null
                                                                }
                                                                <span className='copy-icon' id={String(var_sentences_ind) + String(var_sent_ind)}
                                                                      onClick={async ()=> {
                                                                          await navigator.clipboard.writeText(var_sent[0].toString());
                                                                          window.open('https://demo-vadis.gesis.org:443/_pdf/'+this.props.pdfId+'.pdf#search="'+var_sent[0]+'"', '_blank');
                                                                          // var_content[1].substring(0,25) //#search="text..." Individual parameters, together with their values (separated by & or #), can be no greater than 32 characters in length.

                                                                      }}
                                                                >
                                                                        <Icon iconName='CopyAndOpenPdf'/>
                                                                        <ReactTooltip
                                                                            anchorId={String(var_sentences_ind) + String(var_sent_ind)}
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
                                                        <AccordionItemPanel className='panel-bg-clr accord-margin'>
                                                            <Accordion key={'content' + var_sentences_ind + var_sent_ind} className='row r-margin'>
                                                                {
                                                                    Object.entries(var_sent[1]).map((var_content, var_content_ind) => (

                                                                        var_content[0] === 'score' || var_content[0] === 'common_words' || var_content[0]==='id' || var_content[0]==='type' ? null  // fields not to display
                                                                            :
                                                                        <AccordionItem key={var_sentences_ind + var_sent_ind + var_content_ind} className='col-12 accord-margin'>
                                                                            {
                                                                                // var_content[0] === 'score' || var_content[0] === 'common_words' || var_content[0]==='type' || var_content[0]==='id'?null
                                                                                //     :
                                                                                    typeof var_content[1] === 'string' && !var_content[0].includes('exploredata-')?
                                                                                    <>
                                                                                        <span>
                                                                                            <b
                                                                                                id={var_content[0] + var_sentences_ind + var_sent_ind}
                                                                                               className='orange-clr'>
                                                                                                {var_content[0] + ': '}
                                                                                            </b> {var_content[1]}
                                                                                        </span>
                                                                                        <ReactTooltip
                                                                                            anchorId={var_content[0] + var_sentences_ind + var_sent_ind}
                                                                                            place="top"
                                                                                            // variant="info"
                                                                                            className="tooltip-clr"
                                                                                            // float={true}
                                                                                            content={var_content[0]==='type'?"Variable detection method": var_content[0]==='id'? 'id' : null}/>
                                                                                    </>
                                                                                    : Array.isArray(var_content[1]) ?
                                                                                        var_content[1].length !== 0?
                                                                                            <>
                                                                                                <b id={var_content[0] + var_sent_ind + var_content_ind} className='orange-clr inline-div'>
                                                                                                    {var_content[0] + ': '}
                                                                                                </b>
                                                                                                <ShowMoreText lines={1}
                                                                                                              more={<span className='orange-clr'>Show More</span>}
                                                                                                              less={<span className='orange-clr'>Show less</span>}
                                                                                                              className="orange-clr inline-div"
                                                                                                              expanded={false}
                                                                                                              width={2000}
                                                                                                              truncatedEndingComponent={"... "}
                                                                                                              anchorClass='show-more-less-clickable bg-color'

                                                                                                >
                                                                                                    {/*{var_content[1].join(', ')}*/}
                                                                                                    {var_content[1].map((v, v_ind)=>{
                                                                                                        return <span>
                                                                                                        &nbsp;<a className='bg-color'
                                                                                                                  href={v.includes('exploredata-') ? 'https://search.gesis.org/variables/' + v : null}
                                                                                                                  target='_blank'
                                                                                                                  rel='noreferrer'>
                                                                                                                    {v}
                                                                                                                </a>&nbsp;
                                                                                                        </span>
                                                                                                    })}
                                                                                            </ShowMoreText>
                                                                                                <ReactTooltip
                                                                                                    anchorId={var_content[0] + var_sent_ind + var_content_ind}
                                                                                                    place="top"
                                                                                                    // variant="info"
                                                                                                    className="tooltip-clr"
                                                                                                    // float={true}
                                                                                                    content="Additional related variables"/>

                                                                                            </>
                                                                                            : null
                                                                                        :
                                                                                        <span>
                                                                                            <a className='bg-color'
                                                                                               href={var_content[0].includes('exploredata-') ? 'https://search.gesis.org/variables/' + var_content[0] : null}
                                                                                               target='_blank'
                                                                                               rel='noreferrer'>
                                                                                                <b>{var_content[0] + ':'}</b>
                                                                                            </a>
                                                                                            &nbsp;&nbsp;
                                                                                            <span
                                                                                            //     id={var_content[0] + var_content_ind + Date.now()}
                                                                                            //     className='clickable-text' onClick={async ()=> {
                                                                                            //     await navigator.clipboard.writeText(var_content[1].toString());
                                                                                            //     window.open('http://svko-outcite.gesis.intra:8000/SSOAR/11658.pdf#search="'+var_content[1]+'"');
                                                                                            //     // var_content[1].substring(0,25) //#search="text..." Individual parameters, together with their values (separated by & or #), can be no greater than 32 characters in length.
                                                                                            //
                                                                                            // }}
                                                                                            >
                                                                                                {/*<u>*/}
                                                                                               {'common_words' in var_sent[1] && var_sent[1]['common_words'].length !== 0 ?
                                                                                                        <Highlighter
                                                                                                            highlightClassName="highlight"
                                                                                                            searchWords={var_sent[1]['common_words']}
                                                                                                            autoEscape={true}
                                                                                                            textToHighlight={var_content[1]}/>
                                                                                                        :
                                                                                                        var_content[1]
                                                                                               }
                                                                                               {/*</u>*/}
                                                                                               {/* <ReactTooltip*/}
                                                                                               {/*     anchorId={var_content[0] + var_content_ind + Date.now()}*/}
                                                                                               {/*     place="top"*/}
                                                                                               {/*     variant="info"*/}
                                                                                               {/*     // float={true}*/}
                                                                                               {/* >*/}
                                                                                               {/*     <ol>*/}
                                                                                               {/*         Click will copy the corresponding sentence and open the PDF on new tab to search for the copied text.*/}
                                                                                               {/*         <br/>*/}
                                                                                               {/*         Press following buttons in sequence to search:*/}
                                                                                               {/*         <li>*/}
                                                                                               {/*             Ctrl + F*/}
                                                                                               {/*         </li>*/}
                                                                                               {/*         <li>*/}
                                                                                               {/*             Ctrl + V*/}
                                                                                               {/*         </li>*/}
                                                                                               {/*         <li>*/}
                                                                                               {/*             Enter*/}
                                                                                               {/*         </li>*/}
                                                                                               {/*     </ol>*/}
                                                                                               {/* </ReactTooltip>*/}
                                                                                            </span>
                                                                                            {/*<PdfViewer/>*/}

                                                                                            {/*<div id="mypdf">*/}
                                                                                            {/*    <iframe src="http://svko-outcite.gesis.intra:8000/SSOAR/11658.pdf#search=inequality" width="500" height="500" frameBorder="0"*/}
                                                                                            {/*            scrolling="no">*/}
                                                                                            {/*        <p>Your web browser doesn't support iframes.</p>*/}
                                                                                            {/*    </iframe>*/}
                                                                                            {/*</div>*/}

                                                                                            {/*<object data="http://svko-outcite.gesis.intra:8000/SSOAR/11658.pdf#search=Inequality" type="application/pdf" width="500" height="500">*/}
                                                                                            {/*    <p>Alternative text - include a link <a href="http://svko-outcite.gesis.intra:8000/SSOAR/11658.pdf">to the PDF!</a></p>*/}
                                                                                            {/*</object>*/}

                                                                                            {/*<object data="http://svko-outcite.gesis.intra:8000/SSOAR/11658.pdf#search=inequality" type="application/pdf" width="500" height="500">*/}
                                                                                            {/*    <p>Alternative text - include a link <a href="http://svko-outcite.gesis.intra:8000/SSOAR/11658.pdf">to the PDF!</a></p>*/}
                                                                                            {/*</object>*/}

                                                                                            {/*<embed src= "http://svko-outcite.gesis.intra:8000/SSOAR/11658.pdf" width= "500" height= "375"/>*/}
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
                                <div className="d-flex justify-content-center">
                                    <button type="button" className="btn btn-link bg-color" disabled={this.state.range_values[1][0] < 0.5 || this.state.sentences_within_range_count[var_sentences_ind] === Object.keys(var_sentences[1]).length}
                                            onClick={() => this.state.range_values[1][0] >= 0.2 ? this.handleChange([this.state.range_values[1][0]-0.20, 1.0], var_sentences[0], var_sentences_ind) : null}> Show more sentences
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