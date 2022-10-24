import React, {Component} from "react";
import ShowMoreText from "react-show-more-text";
import './styles/Table.sass'
import Accordions from "./Accordions";

class Table extends Component {
    constructor(props) {
        super(props);

        this.state = {
            input: null,
            button_id: null,
        };
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(id, ind) {
        this.setState({
            button_id: ind
        })
        this.props.getVariableResults(id, ind)
    }

    render() {
        return <table className="table table-hover">
            <tbody>
            {this.props.ssoar_docs.map((doc, ind) => (
                <tr key={ind}>
                    <td className='row'>
                        <h6 className='col-10'>{doc['_source']['title']}</h6>
                        <a className='col-2 text-end bg-color'
                           href={doc['_source']['pdf']}
                           target='_blank'
                           rel='noreferrer'>[source]</a>
                        <div className='col-12 small-txt align-txt'>
                            <ShowMoreText width={0} lines={2} anchorClass='show-more-less-clickable bg-color'>
                                {doc['_source']['abstract']}
                            </ShowMoreText>
                        </div>
                        <div className='d-flex justify-content-center'>
                            <button type="button" className="btn btn-link bg-color" id={ind}
                                    onClick={() => this.handleClick(doc['_id'].split('-')[2], ind)}>Get Variables Data!
                            </button>
                        </div>
                        {
                            this.props.vadis_data[ind] // null and undefined check
                            && Object.keys(this.props.vadis_data[ind]).length !== 0
                            && Object.getPrototypeOf(this.props.vadis_data[ind]) === Object.prototype ?
                                !('error' in this.props.vadis_data[ind]) ?
                                    <Accordions result={this.props.vadis_data[ind]}/>
                                    // 'summary' in this.props.vadis_data[ind] && this.props.vadis_data[ind]['summary'].length ?
                                    //     <div className='d-flex justify-content-center'>
                                    //         <div className='card'>
                                    //             <p className='margin-text'>
                                    //                 <i className='bg-color'><strong>Summary:</strong></i> {this.props.vadis_data[ind]['summary']}
                                    //             </p>
                                    //             {
                                    //                 'variable_sentences' in this.props.vadis_data[ind] && this.props.vadis_data[ind]['variable_sentences'].length ?
                                    //                     <div className='d-flex justify-content-center'>
                                    //                         <ul className='margin-text'><i className='bg-color'>Variable
                                    //                             Sentences:</i>
                                    //                             {this.props.vadis_data[ind]['variable_sentences'].map((vars, ind) =>
                                    //                                 <li key={ind}> {vars}</li>
                                    //                             )}
                                    //                         </ul>
                                    //                     </div>
                                    //                     : null
                                    //             }
                                    //         </div>
                                    //     </div>
                                    //     :
                                    //     null
                                    : <div className='d-flex justify-content-center'>
                                        <span className='err-color'>
                                            Something Went Wrong!
                                        </span>
                                    </div>
                                :
                                this.props.loading[ind] ?
                                    <div className="d-flex justify-content-center">
                                        <div className="spinner-border bg-color" role="status">
                                            {/*<span className="sr-only">Loading...</span>*/}
                                        </div>
                                    </div>
                                    :
                                    null
                        }
                    </td>
                </tr>
            ))}
            </tbody>
        </table>;
    }
}

export default Table;