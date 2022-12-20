import React, {Component} from 'react';
import {useParams} from "react-router-dom";
import SearchBar from './SearchBar';
import './styles/Home.sass';
import Table from "./Table";

function withParams(Component) {
    return props => <Component {...props} params={useParams()}/>;
}

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vadis_data: {},
            loading: false,
            ssoar_docs: [],
            from: 0,
            size: 5,
            vadis_results: false,
            search_results: false,
            // vadis_app_endpoint: 'http://193.175.238.92:8000/vadis_app?ssoar_id=',
            vadis_app_endpoint: 'https://demo-vadis.gesis.org/vadis_app?ssoar_id=',
            // outcite_ssoar_endpoint: 'https://demo-outcite.gesis.org/outcite_ssoar/_search?',
            outcite_ssoar_endpoint: 'https://demo-vadis.gesis.org/outcite_ssoar/_search?',

        };
        this.getVariableResults = this.getVariableResults.bind(this)
        this.getResults = this.getResults.bind(this)
        this.updateStateArrayIndex = this.updateStateArrayIndex.bind(this)
        this.isNumeric = this.isNumeric.bind(this)
    }

    updateStateArrayIndex(arr, ind, val) {
        return arr.map((old_val, i) => i === ind ? val : old_val)
    }

    isNumeric(value) {
        return /^\d+$/.test(value);
    }

    // getVariableResults(id, ind) {
    //     let newLoadingArr = this.updateStateArrayIndex(this.state.loading, ind, true)
    //     this.setState({
    //         loading : newLoadingArr
    //     });
    //     let api_endpoint = this.state.vadis_app_endpoint + id;
    //     fetch(api_endpoint)
    //         .then(response => response.json())
    //         .then(result => {
    //             let newLoadingArr = this.updateStateArrayIndex(this.state.loading, ind, false)
    //             let newVadisArr = this.updateStateArrayIndex(this.state.vadis_data, ind, result)
    //             this.setState({
    //                 vadis_data: newVadisArr,
    //                 loading: newLoadingArr
    //             });
    //         })
    //         .catch(error => {
    //                 let newLoadingArr = this.updateStateArrayIndex(this.state.loading, ind, false)
    //                 let newVadisArr = this.updateStateArrayIndex(this.state.vadis_data, ind, {'error': error})
    //                 this.setState({
    //                     loading: newLoadingArr,
    //                     vadis_data: newVadisArr,
    //                 });
    //                 console.log('error', error)
    //         }
    //             );
    // }

    getVariableResults(id) {
        this.setState({
            loading: true,
            vadis_results: true,
        });
        let api_endpoint = this.state.vadis_app_endpoint + id;
        fetch(api_endpoint)
            .then(response => response.json())
            .then(result => {
                this.setState({
                    vadis_data: result,
                    loading: false,
                });
            })
            .catch(error => {
                    this.setState({
                        vadis_data: {'error': error},
                        loading: false,
                    });
                    console.log('error', error)
                }
            );
    }

    getResults(q, from, size) {
        const {id} = this.props.params;
        let strDocIds = []
        if (id && !q) {
            strDocIds[0] = '"gesis-ssoar-' + String(id) + '"'
        }
        else if(!id && !q){
            let docIds = this.props.idsList.slice(from, from + size)
            docIds.forEach((id, i) => {
                strDocIds[i] = '"gesis-ssoar-' + String(id) + '"'
            });
        }
        q = q ? this.isNumeric(q) ? 'gesis-ssoar-' + q : q.replace(/[;&/\\#,+()$~%.'":*?<>{}]/g, '') : null;
        this.setState({
            ssoar_docs: [],
            loading: true,
            search_results: !!q,
        })
        // To get docs from index
        // let outcite_api_endpoint = q? this.state.outcite_ssoar_endpoint + 'q=(has_fulltext:true AND (fulltext:"' + q + '" OR title:"' + q + '" OR abstract:"' + q + '")) OR _id:"' + q + '"&from=0&size=5' : this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"bool":{"must":[{"term":{"has_fulltext":true}},{"exists":{"field":"abstract"}}]}}}&from=' + from + '&size=' + size
        // docs from file
        let outcite_api_endpoint = q ? this.state.outcite_ssoar_endpoint + 'q=(has_fulltext:true AND (fulltext:"' + q + '" OR title:"' + q + '" OR abstract:"' + q + '")) OR _id:"' + q + '"&from=0&size=5' : this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"terms":{"_id":[' + strDocIds + ']}}}'
        // let outcite_api_endpoint = q ? this.state.outcite_ssoar_endpoint + 'q=title:"' + q + '" OR abstract:"' + q + '" OR _id:"' + q + '"&from=' + from + '&size=' + size : this.state.outcite_ssoar_endpoint + 'from=' + from + '&size=' + size;
        // let outcite_api_endpoint = id ? this.state.outcite_ssoar_endpoint + 'q=_id:' + id : this.state.outcite_ssoar_endpoint + 'from=' + from + '&size=' + size;
        fetch(outcite_api_endpoint)
            .then(response => response.json())
            .then(hits => {
                this.setState({
                    ssoar_docs: hits['hits']['hits'],
                    from: from,
                    size: size,
                    loading: false
                })
                if (id) {
                    this.getVariableResults(id)
                }
            })
            .catch(error => console.log('error', error));
    }

    // clearView() {
    //     console.log('here')
    //     this.setState({
    //         vadis_data: {},
    //         // loading: false,
    //     })
    // }
    //
    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     if (prevState.ssoar_docs !== this.state.ssoar_docs) {
    //         this.clearView();
    //     }
    // }

    async componentDidMount() {
        this.getResults(null, 0, 5)
    }

    render() {
        return (
            <div className='row'>
                <div className='d-flex justify-content-center'>
                    <SearchBar placeholder={'Search query...'} globalSearch
                        // loading={this.state.loading}
                               getResults={this.getResults} from={this.state.from} size={this.state.size}
                    />

                </div>

                {
                    this.state.ssoar_docs.length ? <div className='d-flex justify-content-center'>
                            <Table ssoar_docs={this.state.ssoar_docs}
                                   vadis_data={this.props.params.id && !this.state.search_results? this.state.vadis_data : null}
                                   // vadis_data={this.props.params.id && !this.state.search_results? this.state.vadis_data : null}
                                // getVariableResults={this.getVariableResults}
                                   loading={this.state.loading}
                                   getParams={this.props.getParams}
                                   detailedView={!!this.props.params.id && !this.state.search_results}
                                   // detailedView={!!this.props.params.id && (this.props.vadis_data && Object.keys(this.props.vadis_data).length !== 0
                                   // && Object.getPrototypeOf(this.props.vadis_data) === Object.prototype)}
                            />
                        </div>
                        :
                        this.state.loading ?
                            <div className="d-flex justify-content-center">
                                <div className="spinner-border bg-color" role="status">
                                    {/*<span className="sr-only">Loading...</span>*/}
                                </div>
                            </div>
                            :
                            null
                }
                {
                    this.state.ssoar_docs.length > 1 && !this.state.search_results ?
                        <div className="d-flex justify-content-center">
                            <button type="button" className="btn btn-link bg-color"
                                // disabled={this.state.from < 5 || !this.state.loading.every(element => element === false)}
                                    disabled={this.state.from < 5}
                                    onClick={() => this.getResults(null, this.state.from - this.state.size, this.state.size)}>&laquo; Back
                            </button>
                            <button type="button" className="btn btn-link bg-color"
                                // disabled={!this.state.loading.every(element => element === false)}
                                    onClick={() => this.getResults(null, this.state.from + this.state.size, this.state.size)}>Next &raquo;
                            </button>
                        </div>
                        :
                        // this.state.ssoar_docs.length === 1

                        this.state.search_results && !this.state.loading ?
                            <div className="d-flex justify-content-center">
                                <button type="button" className="btn btn-link bg-color"
                                    // disabled={!this.state.loading.every(element => element === false)}
                                        onClick={() => this.getResults(null, this.state.from, this.state.size)}>&laquo; Back
                                    {/*onClick={() => this.props.getParams(null)}>&laquo; Back*/}
                                </button>
                            </div>
                            :
                            this.state.vadis_results && !this.state.loading ?
                                <div className="d-flex justify-content-center">
                                    <button type="button" className="btn btn-link bg-color"
                                        // disabled={!this.state.loading.every(element => element === false)}
                                        //     onClick={() => this.getResults(null, this.state.from, this.state.size)}>&laquo; Back
                                            onClick={() => this.props.getParams(null)}>&laquo; Back
                                    </button>
                                </div>
                                :
                                null
                }
            </div>

        );
    }
}

export default withParams(Home);
