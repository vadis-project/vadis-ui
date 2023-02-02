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
            merged_results: [],
            actual_hits: [],
            from: 0,
            size: 5,
            search_results: false,
            // vadis_app_endpoint: 'http://193.175.238.92:8000/vadis_app?ssoar_id=',
            vadis_app_endpoint: 'https://demo-vadis.gesis.org/vadis_app?ssoar_id=',
            // outcite_ssoar_endpoint: 'https://demo-outcite.gesis.org/outcite_ssoar/_search?',
            outcite_ssoar_endpoint: 'https://demo-vadis.gesis.org/outcite_ssoar/_search?',

        };
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

    componentDidMount() {
        // const {id} = this.props.params;
        this.getResults(null, 0, 5)
        // if(!id){this.getResults(null, 0, 5)}
    }

    getResults(q, from, size) {
        const {id} = this.props.params;
        let strDocIds = []
        let merged_results_list = []
        if (id && !q) {
            strDocIds[0] = '"gesis-ssoar-' + String(id) + '"'
        } else if (!id && !q) {
            let docIds = this.props.idsList.slice(from, from + size)
            docIds.forEach((id, i) => {
                strDocIds[i] = '"gesis-ssoar-' + String(id) + '"'
            });
        }
        q = q ? this.isNumeric(q) ? 'gesis-ssoar-' + q : q.replace(/[;&/\\#,+()$~%.'":*?<>{}]/g, '') : null;
        this.setState({
            merged_results: [],
            search_results: !!q,
        })
        // To get docs from index
        // let outcite_api_endpoint = q? this.state.outcite_ssoar_endpoint + 'q=(has_fulltext:true AND (fulltext:"' + q + '" OR title:"' + q + '" OR abstract:"' + q + '")) OR _id:"' + q + '"&from=0&size=5' : this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"bool":{"must":[{"term":{"has_fulltext":true}},{"exists":{"field":"abstract"}}]}}}&from=' + from + '&size=' + size
        // get doc ids from file
        let outcite_api_endpoint = q ? this.state.outcite_ssoar_endpoint + 'q=(has_fulltext:true AND (fulltext:"' + q + '" OR title:"' + q + '" OR abstract:"' + q + '")) OR _id:"' + q + '"&from=0&size=5' : this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"terms":{"_id":[' + strDocIds + ']}}}'
        fetch(outcite_api_endpoint)
            .then(response => response.json())
            .then(hits => {
                this.setState({
                    actual_hits: hits['hits']['hits'],
                });
                hits['hits']['hits'].forEach((obj, i) => {
                    fetch(this.state.vadis_app_endpoint + obj['_id'].split('-')[2])
                        .then(resp => resp.json())
                        .then(res => {
                            let merged_obj = {...obj, ...{'vadis_data': res}}
                            merged_results_list.push(merged_obj)
                            this.setState({
                                from: from,
                                size: size,
                            })
                        }).catch(error => {
                        let merged_obj = {...obj, ...{'vadis_data': {'error': error}}}
                        merged_results_list.push(merged_obj)
                        this.setState({
                            from: from,
                            size: size,
                        })
                        console.log('error', error)
                    });
                })
            }).catch(error => console.log('error', error));
        this.setState({
            merged_results: merged_results_list,
        });
    }

    render() {
        let loading = this.state.actual_hits.length !== this.state.merged_results.length || this.state.actual_hits.length === 0
        return (
            <div className='row'>
                <div className='d-flex justify-content-center'>
                    <SearchBar placeholder={'Search query...'} globalSearch
                               getResults={this.getResults} from={this.state.from} size={this.state.size}/>
                </div>
                {
                    this.state.merged_results.length && !loading ? <div className='d-flex justify-content-center'>
                            <Table key={this.state.merged_results.length} ssoar_docs={this.state.merged_results}
                                   loading={loading}
                                   getParams={this.props.getParams}
                                   detailedView={!!this.props.params.id && !this.state.search_results}
                            />
                        </div>
                        :
                        loading ?
                            <div className="d-flex justify-content-center">
                                <div className="spinner-border bg-color" role="status">
                                    {/*<span className="sr-only">Loading...</span>*/}
                                </div>
                            </div>
                            :
                            null
                }
                {
                    this.state.merged_results.length > 1 && !this.state.search_results && !loading ?
                        <div className="d-flex justify-content-center">
                            <button type="button" className="btn btn-link bg-color" disabled={this.state.from < 5}
                                    onClick={() => this.getResults(null, this.state.from - this.state.size, this.state.size)}>&laquo; Back
                            </button>
                            <button type="button" className="btn btn-link bg-color"
                                    onClick={() => this.getResults(null, this.state.from + this.state.size, this.state.size)}>Next &raquo;
                            </button>
                        </div>
                        :
                        this.state.search_results && !loading ?
                            <div className="d-flex justify-content-center">
                                <button type="button" className="btn btn-link bg-color"
                                        onClick={() => this.getResults(null, this.state.from, this.state.size)}>&laquo; Back
                                </button>
                            </div>
                            :
                            !loading && this.state.merged_results.length > 0 ?
                                <div className="d-flex justify-content-center">
                                    <button type="button" className="btn btn-link bg-color"
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
