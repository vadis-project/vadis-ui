import React, {Component} from 'react';
import SearchBar from './SearchBar'
import './styles/Home.sass'
import Table from "./Table";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vadis_data: [{}, {}, {}, {}, {}],
            loading: false,
            ssoar_docs: [],
            from: 0,
            size: 5,
            vadis_app_endpoint: 'http://193.175.238.92:8000/vadis_app?ssoar_id=',
            outcite_ssoar_endpoint: 'https://demo-outcite.gesis.org/outcite_ssoar/_search?'

        };
        this.getVariableResults = this.getVariableResults.bind(this)
        this.getResults = this.getResults.bind(this)
    }

    getVariableResults(id, ind) {
        this.setState({
            loading: true,
            button_id: ind
        })
        let api_endpoint = this.state.vadis_app_endpoint + id;
        fetch(api_endpoint)
            .then(response => response.json())
            .then(result => {
                this.setState(({vadis_data}) => ({
                    vadis_data: [
                        ...vadis_data.slice(0, ind),
                        {
                            ...vadis_data[ind],
                            result,
                        },
                        ...vadis_data.slice(ind + 1)
                    ],
                    loading: false
                }));
            })
            .catch(error => console.log('error', error));
    }

    getResults(id, from, size) {
        this.setState({
            ssoar_docs: [],
            loading: true
        })
        let outcite_api_endpoint = id? this.state.outcite_ssoar_endpoint + 'q=_id:'+id : this.state.outcite_ssoar_endpoint + 'from=' + from + '&size=' + size;
        fetch(outcite_api_endpoint)
            .then(response => response.json())
            .then(hits => {
               this.setState({
                    ssoar_docs: hits['hits']['hits'],
                    from: from,
                    size: size,
                    loading: false
                })
            })
            .catch(error => console.log('error', error));
    }

    clearView() {
        this.setState({
            vadis_data: [{}, {}, {}, {}, {}]
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.ssoar_docs !== this.state.ssoar_docs) {
            this.clearView();
        }
    }

    componentDidMount() {
        this.getResults(null, 0, 5)
    }

    render() {
        return (
            <>
                <div className='row'>
                    <div className='d-flex justify-content-center'>
                        <SearchBar placeholder={'Search by id...'} globalSearch
                                   // getVariableResults={this.getVariableResults}
                                   getResults={this.getResults}
                        />
                    </div>

                    {
                        this.state.ssoar_docs.length?<div className='d-flex justify-content-center'>
                        <Table ssoar_docs={this.state.ssoar_docs}
                            vadis_data={this.state.vadis_data}
                            getVariableResults={this.getVariableResults}
                               loading={this.state.loading}
                        />
                    </div>
                            :
                            this.state.loading ?
                                <div className="d-flex justify-content-center">
                                    <div className="spinner-border clr-cadetblue" role="status">
                                        {/*<span className="sr-only">Loading...</span>*/}
                                    </div>
                                </div>
                                :
                                null
                    }
                </div>
                {
                    this.state.ssoar_docs.length>1?
                    <div className="d-flex justify-content-center">
                    <button type="button" className="btn btn-link clr-cadetblue"
                            onClick={() => this.getResults(null, this.state.from + this.state.size, this.state.size)}>Next &raquo; </button>
                    <button type="button" className="btn btn-link clr-cadetblue" disabled={this.state.from < 5}
                            onClick={() => this.getResults(null, this.state.from - this.state.size, this.state.size)}>&laquo; Back
                    </button>
                </div>:
                        this.state.ssoar_docs.length===1?<button type="button" className="btn btn-link clr-cadetblue"
                               onClick={() => this.getResults(null, 0, 5)}>&laquo; Back
                        </button>:null}
            </>
        );
    }
}

export default Home;
