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
        // this.props.getVariableResults(id, ind)
        this.props.getParams(id)
    }

    render() {
        return <table className="table table-striped table-hover">
            <tbody>
            {this.props.ssoar_docs.map((doc, ind) => (
                <tr key={ind}>
                    <td className='row'>
                        <div className='col-11'>
                            <h6 className='bg-color'
                                onClick={() => this.handleClick(doc['_id'].split('-')[2], ind)}>
                                <u>
                                    {doc['_source']['title']}
                                    &nbsp;&nbsp; <span className="fw-lighter">[{doc['_id']}]</span>
                                </u>
                            </h6>
                        </div>
                        {'url' in doc['_source'] ? <a className='col-1 text-end bg-color'
                                                      href={doc['_source']['url']}
                                                      target='_blank'
                                                      rel='noreferrer'>[source]</a>
                            :
                            null
                        }
                        {'authors' in doc['_source'] ?
                            <div className='col-12 small-txt'>
                                {doc['_source']['authors'].map((author, i) => (
                                    <span className="fw-normal" key={i}>
                                    <i> &#x2022; {'name' in author ? author['name'] : author['name_string']} </i>
                                </span>
                                ))}
                            </div> : null}

                        {'source' in doc['_source'] && 'src_journal' in doc['_source']['source'] ?
                            <div className='col-12 small-txt'>
                                <span className="fw-light" key='src_journal'>
                                    <i> {doc['_source']['source']['src_journal']} </i>
                                </span>
                            </div> : null}

                        {'date_info' in doc['_source'] && 'issue_date' in doc['_source']['date_info'] ?
                            <div className='col-12 small-txt'>
                                <span className="fw-light" key='src_journal'>
                                    <i> {doc['_source']['date_info']['issue_date']} </i>
                                </span>
                            </div>
                            : 'dates' in doc['_source'] && 'issue_date' in doc['_source']['dates'] ?
                                <div className='col-12 small-txt'>
                                    <span className="fw-light" key='src_journal'>
                                        <i> {doc['_source']['dates']['issue_date']} </i>
                                    </span>
                                </div>
                                : null}

                        {'language' in doc['_source'] && doc['_source']['language'] ?
                            <div className='col-12 small-txt'>
                                <span className="fw-light" key='src_journal'>
                                    <i> {doc['_source']['language']} </i>
                                </span>
                            </div>
                            : null}

                        {'abstract' in doc['_source'] && doc['_source']['abstract'] ?
                            <div className='col-12 small-txt align-txt'>
                                <ShowMoreText width={0} lines={this.props.detailedView ? 0 : 3}
                                              anchorClass='show-more-less-clickable bg-color'>
                                    {doc['_source']['abstract']}
                                </ShowMoreText>
                            </div>
                            : null}
                        {/*{!this.props.detailedView ? <div className='d-flex justify-content-center'>*/}
                        {/*    <button type="button" className="btn btn-link bg-color" id={ind}*/}
                        {/*            // disabled={!!(this.props.vadis_data[ind] && Object.keys(this.props.vadis_data[ind]).length !== 0*/}
                        {/*            //     && Object.getPrototypeOf(this.props.vadis_data[ind]) === Object.prototype)}*/}
                        {/*            onClick={() => this.handleClick(doc['_id'].split('-')[2], ind)}>Get Variables Data!*/}
                        {/*    </button>*/}
                        {/*</div> : null}*/}
                        {
                            this.props.detailedView ?
                                this.props.loading ?
                                    <div className="d-flex justify-content-center">
                                        <div className="spinner-border bg-color" role="status">
                                            {/*<span className="sr-only">Loading...</span>*/}
                                        </div>
                                    </div>
                                    : this.props.vadis_data && !('error' in this.props.vadis_data) ?
                                        <Accordions result={this.props.vadis_data}/>
                                        : <div className='d-flex justify-content-center'>
                                            <span className='err-color'>
                                                Something Went Wrong!
                                            </span>
                                        </div>
                                : null
                            // !this.props.detailedView ?
                            // this.props.vadis_data[ind] // null and undefined check
                            // && Object.keys(this.props.vadis_data[ind]).length !== 0
                            // && Object.getPrototypeOf(this.props.vadis_data[ind]) === Object.prototype ?
                            //         !('error' in this.props.vadis_data[ind]) ?
                            //         <Accordions result={this.props.vadis_data[ind]}/>
                            //         :
                            //         <div className='d-flex justify-content-center'>
                            //         <span className='err-color'>
                            //             Something Went Wrong!
                            //         </span>
                            //         </div>
                            // :
                            // this.props.loading[ind] ?
                            //     <div className="d-flex justify-content-center">
                            //         <div className="spinner-border bg-color" role="status">
                            //             {/*<span className="sr-only">Loading...</span>*/}
                            //         </div>
                            //     </div>
                            //     :
                            //     null
                            // !('error' in this.props.vadis_data) ?
                            //     <Accordions result={this.props.vadis_data}/>
                            //     : null

                        }
                    </td>
                </tr>
            ))}
            </tbody>
        </table>;
    }
}

export default Table;