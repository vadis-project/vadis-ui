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

class Accordions extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Accordion className={this.props.children?'row r-margin':'row'} allowMultipleExpanded allowZeroExpanded>
                {
                    Object.entries(this.props.result).map((res, res_ind) => (
                        // typeof res[1] === 'string' || res[1] instanceof String?
                        typeof res[1] === 'string' || res[1] instanceof String || !isNaN(res[1])?
                        //             res[0] !== 'score' ?
                                    <AccordionItem className='col-12' key={res_ind}>
                                        {/*{res[0]!=='sentence'?*/}
                                            <span><b className='bg-color'>{res[0] + ': '}</b>{res[1]}</span>
                                        {/*    :*/}
                                        {/*    null*/}
                                        {/*}*/}
                                    </AccordionItem>
                                    // :
                                    //    null
                            :
                            typeof res[1] === 'object' && Object.keys(res[1]).length !== 0 && !Array.isArray(res[1]) && res[1] !== null?
                                // res_ind<3?
                                    <AccordionItem className='col-12' key={res_ind}>
                                        <AccordionItemHeading>
                                            <AccordionItemButton className='accordion__button'>
                                                {/*{res[0].includes('sentence_')?res[1]['sentence']:res[0]}*/}
                                                {res[0]}
                                            </AccordionItemButton>
                                        </AccordionItemHeading>
                                        <AccordionItemPanel className='panel-bg-clr'>
                                            <Accordions result={res[1]} children/>
                                        </AccordionItemPanel>
                                    </AccordionItem>
                                    // :
                                    // Object.entries(res[1]).map((rds, rds_ind) => (
                                    //     <AccordionItem className='col' key={rds_ind}>
                                    //         <span><b className='margin-text bg-color'>{rds[0] + ': '}</b>{JSON.stringify(rds[1])}</span>
                                    //         {/*<AccordionItemHeading>*/}
                                    //         {/*    <AccordionItemButton className='accordion__button'>*/}
                                    //         {/*        {rds[0] + )}*/}
                                    //         {/*    </AccordionItemButton>*/}
                                    //         {/*</AccordionItemHeading>*/}
                                    //         {/*<AccordionItemPanel className='panel-bg-clr'>*/}
                                    //         {/*    <Accordions result={rds[1]} children/>*/}
                                    //         {/*</AccordionItemPanel>*/}
                                    //     </AccordionItem>
                                    // ))

                                :
                                null
                        )
                    )
                }
            </Accordion>
            // <Accordion className='row' allowMultipleExpanded allowZeroExpanded>
            //     {
            //         Object.entries(this.props.result).map((res, res_ind) => (
            //             // console.log(Object.hasOwn(this.props.result, 'summary')),
            //                 res[1]? <AccordionItem className={this.props.children?'col-12':'col-6'} key={res_ind}>
            //             {/*res[1].length ? <AccordionItem className='col' key={res_ind}>*/}
            //                 <AccordionItemHeading>
            //                     <AccordionItemButton className='accordion__button'>
            //                         {res[0]}
            //                     </AccordionItemButton>
            //                 </AccordionItemHeading>
            //                 <AccordionItemPanel className='panel-bg-clr'>
            //                     {
            //                         typeof res[1] === 'object' && !Array.isArray(res[1]) && res[1] !== null?
            //                             <Accordion allowMultipleExpanded allowZeroExpanded>
            //                                 { Object.entries(res[1]).map((vars, vars_ind) =>
            //                                 <AccordionItem key={vars_ind}>
            //                                     <AccordionItemHeading>
            //                                         <AccordionItemButton>
            //                                             {vars[0]}
            //                                         </AccordionItemButton>
            //                                     </AccordionItemHeading>
            //                                     <AccordionItemPanel>
            //                                         {typeof vars[1] === 'object' && !Array.isArray(vars[1]) && vars[1] !== null?
            //                                             <Accordion allowMultipleExpanded allowZeroExpanded>
            //                                             {Object.entries(vars[1]).map((sents, sents_ind) =>
            //                                                     typeof sents[1] === 'string' || sents[1] instanceof String || !isNaN(sents[1])?
            //                                                         sents[0]!=='score'?
            //                                                             <AccordionItem key={sents_ind}>
            //                                                                 <span><b>{sents[0] + ': ' }</b>{sents[1]}</span>
            //                                                             </AccordionItem>
            //                                                             :
            //                                                             null
            //                                                         :
            //                                                         <AccordionItem key={sents_ind}>
            //                                                         <AccordionItemHeading>
            //                                                             <AccordionItemButton>
            //                                                                 {sents[0]}
            //                                                             </AccordionItemButton>
            //                                                         </AccordionItemHeading>
            //                                                             <AccordionItemPanel>
            //                                                                 {
            //                                                                     typeof sents[1] === 'object' && !Array.isArray(sents[1]) && sents[1] !== null ?
            //                                                                         <Accordion allowMultipleExpanded allowZeroExpanded>
            //                                                                             {Object.entries(sents[1]).map((sen, sen_ind) =>
            //                                                                                     typeof sen[1] === 'string' || sen[1] instanceof String || !isNaN(sen[1])?
            //                                                                                         sen[0]!=='score'?
            //                                                                                             <AccordionItem key={sen_ind}>
            //                                                                                                 <span><b>{sen[0] + ': ' }</b>{sen[1]}</span>
            //                                                                                             </AccordionItem>
            //                                                                                             :
            //                                                                                             null
            //                                                                                         :
            //                                                                                             <AccordionItem key={sen_ind}>
            //                                                                                             <AccordionItemHeading>
            //                                                                                                 <AccordionItemButton>
            //                                                                                                     {sen[0]}
            //                                                                                                 </AccordionItemButton>
            //                                                                                             </AccordionItemHeading>
            //                                                                                             <AccordionItemPanel>
            //                                                                                                 <Accordions
            //                                                                                                     result={sen[1]}
            //                                                                                                     children/>
            //                                                                                             </AccordionItemPanel>
            //                                                                                             </AccordionItem>
            //                                                                             )}
            //                                                                         </Accordion>
            //                                                                         :
            //                                                                         <p className='margin-text'>
            //                                                                             {sents[1]}
            //                                                                         </p>
            //
            //                                                                 }
            //                                                             </AccordionItemPanel>
            //                                                         </AccordionItem>
            //                                             )}
            //                                         </Accordion>
            //                                         :
            //                                             <p className='margin-text'>
            //                                                 {vars[1]}
            //                                             </p>
            //                                         }
            //                                         {/*<Accordions result={vars[1]} children/>*/}
            //                                     </AccordionItemPanel>
            //                                 </AccordionItem>
            //                             )}
            //                             </Accordion>
            //
            //                             // <Accordions result={res[1]} children/>
            //                             // Object.entries(res[1]).map((vars, ind) =>
            //                             //     <Accordions key={ind} result={vars}/>
            //                             // )
            //                         // res[1].length > 1 ?
            //                         //     <ul className='margin-text'>
            //                         //         {/*<u className='bg-color'>Variable Sentences:</u>*/}
            //                         //         {res[1].map((vars, ind) =>
            //                         //             <li key={ind}> {vars}</li>
            //                         //         )}
            //                         //     </ul>
            //                             :
            //                             <p className='margin-text'>
            //                                 {/*<span className='bg-color'><b>Autogenerated Summary: </b></span>*/}
            //                                 {res[1]}
            //                             </p>
            //                     }
            //                 </AccordionItemPanel>
            //             </AccordionItem> : null
            //         ))
            //     }
            // </Accordion>
        );
    }
}

export default Accordions;