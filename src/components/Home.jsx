import React, {Component} from 'react';
import SearchBar from './SearchBar';
import './styles/Home.sass';
import Table from "./Table";
import idsList from '../data/vadis_app_ssoar_list.json';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vadis_data: [{}, {}, {}, {}, {}],
            loading: [false, false, false, false, false],
            results_loading: false,
            ssoar_docs: [],
            ssoar_ids_list: {},
            from: 0,
            size: 5,
            search_results: false,
            // vadis_app_endpoint: 'http://193.175.238.92:8000/vadis_app?ssoar_id=',
            vadis_app_endpoint: 'https://demo-vadis.gesis.org/vadis_app?ssoar_id=',
            // outcite_ssoar_endpoint: 'https://demo-outcite.gesis.org/outcite_ssoar/_search?',
            outcite_ssoar_endpoint: 'https://demo-vadis.gesis.org/outcite_ssoar/_search?',
            vadis_app_ssoar_list_endpoint: 'https://demo-vadis.gesis.org/ssoar_list'

        };
        this.getVariableResults = this.getVariableResults.bind(this)
        this.getResults = this.getResults.bind(this)
        this.updateStateArrayIndex = this.updateStateArrayIndex.bind(this)
        this.isNumeric = this.isNumeric.bind(this)
    }

    updateStateArrayIndex(arr, ind, val){
        return arr.map((old_val, i) => i === ind ? val : old_val)
    }

    isNumeric(value) {
        return /^\d+$/.test(value);
    }

    getVariableResults(id, ind) {
        let newLoadingArr = this.updateStateArrayIndex(this.state.loading, ind, true)
        this.setState({
            loading : newLoadingArr
        });
        let api_endpoint = this.state.vadis_app_endpoint + id;
        fetch(api_endpoint)
            .then(response => response.json())
            .then(result => {
                let newLoadingArr = this.updateStateArrayIndex(this.state.loading, ind, false)
                // let newVadisArr = this.updateStateArrayIndex(this.state.vadis_data, ind, myData)
                let newVadisArr = this.updateStateArrayIndex(this.state.vadis_data, ind, result)
                this.setState({
                    vadis_data: newVadisArr,
                    loading: newLoadingArr
                });
            })
            .catch(error => {
                    let newLoadingArr = this.updateStateArrayIndex(this.state.loading, ind, false)
                    let newVadisArr = this.updateStateArrayIndex(this.state.vadis_data, ind, {'error': error})
                    this.setState({
                        loading: newLoadingArr,
                        vadis_data: newVadisArr,
                    });
                    console.log('error', error)
            }
                );
    }

    getResults(q, from, size) {
        // if (Object.keys(this.state.ssoar_ids_list).length!==0){
        //     let docIds=this.state.ssoar_ids_list['ids'].slice(from, from+size)
            let docIds = idsList['ids'].slice(from, from + size)
            let strDocIds = []
            docIds.forEach((id, i) => {
                strDocIds[i] = '"gesis-ssoar-' + String(id) + '"'
            });
            q = q ? this.isNumeric(q) ? 'gesis-ssoar-' + q : q.replace(/[;&/\\#,+()$~%.'":*?<>{}]/g, '') : null;
            this.setState({
                ssoar_docs: [],
                results_loading: true,
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
                        results_loading: false
                    })
                })
                .catch(error => console.log('error', error));
        // }
    }

    clearView() {
        this.setState({
            vadis_data: [{}, {}, {}, {}, {}],
            loading: [false, false, false, false, false],
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.ssoar_docs !== this.state.ssoar_docs) {
            this.clearView();
        }
    }

    async componentDidMount() {
        await fetch(this.state.vadis_app_ssoar_list_endpoint)
            .then(response => response.json())
            .then(result => {
                this.setState({
                    ssoar_ids_list: result,
                })
            })
            .catch(error => console.log('error', error));

        // if (Object.keys(this.state.ssoar_ids_list).length!==0){
        //     this.getResults(null, 0, 5)
        // }
        this.getResults(null, 0, 5)

    }

    render() {
        return (
                <div className='row'>
                    <div className='d-flex justify-content-center'>
                        <SearchBar placeholder={'Search query...'} globalSearch
                            // getVariableResults={this.getVariableResults}
                            loading={this.state.loading}
                                   getResults={this.getResults} from={this.state.from} size={this.state.size}
                        />

                    </div>

                    {
                        this.state.ssoar_docs.length ? <div className='d-flex justify-content-center'>
                                <Table ssoar_docs={this.state.ssoar_docs}
                                       vadis_data={this.state.vadis_data}
                                       getVariableResults={this.getVariableResults}
                                       loading={this.state.loading}
                                />
                            </div>
                            :
                            this.state.results_loading?
                                <div className="d-flex justify-content-center">
                                    <div className="spinner-border bg-color" role="status">
                                        {/*<span className="sr-only">Loading...</span>*/}
                                    </div>
                                </div>
                                :
                                null
                    }
                    {
                        this.state.ssoar_docs.length > 1 && !this.state.search_results?
                            <div className="d-flex justify-content-center">
                                <button type="button" className="btn btn-link bg-color" disabled={this.state.from < 5 || !this.state.loading.every(element => element === false)}
                                        onClick={() => this.getResults(null, this.state.from - this.state.size, this.state.size)}>&laquo; Back
                                </button>
                                <button type="button" className="btn btn-link bg-color" disabled={!this.state.loading.every(element => element === false)}
                                        onClick={() => this.getResults(null, this.state.from + this.state.size, this.state.size)}>Next &raquo;
                                </button>
                            </div>
                            :
                            // this.state.ssoar_docs.length === 1

                            this.state.search_results && !this.state.results_loading?
                                <div className="d-flex justify-content-center">
                                    <button type="button" className="btn btn-link bg-color" disabled={!this.state.loading.every(element => element === false)}
                                                                                              onClick={() => this.getResults(null, this.state.from, this.state.size)}>&laquo; Back
                                    </button>
                                </div>
                                :
                                null
                    }
                </div>

        );
    }
}

export default Home;
