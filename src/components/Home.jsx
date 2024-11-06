import React, {Component} from 'react';
import {useParams} from "react-router-dom";
import SearchBar from './SearchBar';
import './styles/Home.sass';
import Table from "./Table";
import vadisHome from '../images/vadis-home.png'

function withParams(Component) {
    return props => <Component {...props} params={useParams()}/>;
}

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            actual_hits: [],
            hits_count: null,
            from: 0,
            size: 5,
            sort_filter: 'year_desc_ids',
            searched: false,
            search_query: null,
            // vadis_app_endpoint: 'https://demo-vadis.gesis.org/vadis_app?doc_id=',
            // outcite_ssoar_endpoint: 'https://demo-outcite.gesis.org/outcite_ssoar/_search?',
            vadis_ssoar_endpoint: 'https://demo-vadis.gesis.org/vadis_ssoar/_search?'
        };
        this.getResults = this.getResults.bind(this)
        this.sortBy = this.sortBy.bind(this)
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
        this.getResults(this.state.search_query, 0, 5)
    }

    async sortBy(filter){
        await this.setState({
            sort_filter: filter,
            // orig_ids_list: this.props.idsList[filter]
        })
        if(!this.state.searched){
            this.getResults(null, 0, this.state.size)
            // this.getResults(null, this.state.from, this.state.size)
        }
        else{
            this.getResults(this.state.search_query, this.state.from, this.state.size)
        }

    }

    getResults(q, from, size) {
        const {id} = this.props.params;
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        let langFilter = this.state.sort_filter === 'lang_en'? { "term": { "language": "en" } } : this.state.sort_filter === 'lang_de'? { "term": { "language": "de" } } : {'match_all': {}}
        let sortFilter = this.state.sort_filter === 'year_asc_ids'? {
            "date_info.issue_date.keyword": {"order": "asc"} // order: desc or asc
        } : this.state.sort_filter === 'year_desc_ids'? {
            "date_info.issue_date.keyword": {"order": "desc"}
        } : this.state.sort_filter === 'vs_count_asc_ids'?  {
            "_script": {
                "type": "number",
                "script": {
                    // "source": "doc['my_text_field'].value.length()",
                    "source": "params._source.vadis_data_2.variable_sentences.size()",
                    "lang": "painless"
                },
                "order": "asc"  // or "desc" for descending order
            }
        } : this.state.sort_filter === 'vs_count_desc_ids'?  {
            "_script": {
                "type": "number",
                "script": {
                    // "source": "doc['my_text_field'].value.length()",
                    "source": "params._source.vadis_data_2.variable_sentences.size()",
                    "lang": "painless"
                },
                "order": "desc"  // or "desc" for descending order
            }
        } : {}
        q = q && this.isNumeric(q) ? 'gesis-ssoar-' + q : q;
        this.setState({
            searched: false,
            search_query: q
        })
        let query = id && !q? JSON.stringify({"query":{"terms":{"_id": [id]}}})
            : q && !(q.includes('gesis-ssoar-')) ?
            JSON.stringify({
                "from":from,
                "size":size,
                "query": {
                    "bool": {
                        "must": [  // "filter" instead of "must" doesn't give relevance score
                            {
                                "multi_match": {
                                    "query": q,
                                    "type": "best_fields",
                                    // "fields": ["title", "abstract", "fulltext"],
                                    "fields": ["title^3", "abstract^2", "pdftotext_fulltext^1"],
                                    "operator": "and"
                                }
                            },
                            {
                                "exists": {
                                    "field": "vadis_data_2"
                                }
                            },
                            langFilter
                        ]
                    }
                },
                "sort": [
                    sortFilter
                    // {
                    //     "date_info.issue_date.keyword": {"order": "asc"} // order: desc or asc
                    // }
                ]
            })
            : q && q.includes('gesis-ssoar-')? JSON.stringify({"query":{"terms":{"_id":[q]}}})
            : JSON.stringify({
                        "from": from,
                        "size": size,
                        // "query":{'match_all': {}},
                        "query": {
                            "bool": {
                                "must": [
                                    {
                                        "exists": {
                                            "field": "vadis_data_2"
                                        }
                                    },
                                    langFilter
                                ]
                            }
                        },
                        "sort": [
                            sortFilter,
                            // {
                            //     "date_info.issue_date.keyword": {"order": "asc"}  // order: desc or asc
                            // }
                        ]
            })
        let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: query,
            redirect: 'follow'
        };
        fetch(this.state.vadis_ssoar_endpoint, requestOptions)
            .then(response => response.json())
            .then(hits => {
                if(hits['hits']['hits'].length > 0){
                    hits['hits']['hits'].forEach((obj, i) => {
                        if ('dates' in obj['_source'] && 'issue_date' in obj['_source']['dates']){ // issue with actual data -> renaming key 'dates' to 'date_info' to have it identical in all objects
                            obj['_source']['date_info'] = {'issue_date': obj['_source']['dates']['issue_date']}
                            delete obj['_source']['dates']
                        }
                        else if (!('dates' in obj['_source'] || 'date_info' in obj['_source'])){
                            obj['_source']['date_info'] = {'issue_date': '0000'}
                        }
                    })
                }
                else{
                    this.setState({
                        searched: true,
                    })
                }
                this.setState({
                    actual_hits: hits['hits']['hits'],
                    hits_count: hits['hits']['total']['value'],
                    from: from,
                    size: size,
                    searched: !!q,
                });
            }).catch(error => console.log('error', error));
    }

    render() {
        let loading = !this.state.hits_count && !this.state.searched
        let noResult = this.state.hits_count === 0 && this.state.searched
        if(this.state.sort_filter==='relevance' && !this.state.search_query) // update filter to 'year' if the search query gets cleared while 'relevance' selected as filter
        {
            this.sortBy('year_desc_ids')
        }
        return (
            <>
                <div className='row'>
                    <div className='card'>
                        {!this.props.params.id ?
                            <div className='row mgn-top'>
                                <p className='col-9 padding-text'>
                                    Welcome to the search demo of the&nbsp;
                                    <a className='bg-color'
                                        href='https://vadis-project.github.io/'
                                        target='_blank'
                                        rel='noreferrer'>
                                        <b>VADIS</b>
                                    </a>
                                    &nbsp;project (VAriable Detection, Interlinking and Summarization).
                                    Starting with classical document search, it allows for searching and discovering survey variables in context of scholarly publications. The key idea of the VADIS project is to identify references to survey variables within the full text of research literature, creating semantic links based on these references and making the resulting data available.
                                    <br/><br/>
                                    Need help? Visit&nbsp;
                                    <a className='bg-color'
                                       href='https://demo-vadis.gesis.org/intro'
                                       target='_self'
                                       rel='noreferrer'>
                                        <b>introductory page</b>
                                    </a>
                                    &nbsp;for wholesome understanding of the data displayed.

                                </p>
                                <img className='col-3 img-home' src={vadisHome} alt=''/>
                            </div> : null
                        }
                    <div className='d-flex justify-content-center'>
                        {/*{this.state.actual_hits.length>0? <p className='lbl'><b> {this.state.searched || this.props.params.id ? this.state.hits_count : this.state.hits_count} Hit(s) </b>&nbsp;&nbsp;&nbsp;</p> : null}*/}
                        {this.state.actual_hits.length>0? <p className='lbl'><b> {this.state.hits_count} Hit(s) </b>&nbsp;&nbsp;&nbsp;</p> : null}
                        {/*{!this.props.params.id?*/}
                            <SearchBar placeholder={'Search by id, title or keyword(s)'} globalSearch
                                    getResults={this.getResults} from={0} size={this.state.size} serchQuery={this.state.search_query}/>
                            {/*:null}*/}
                        {this.state.actual_hits.length>1 || this.state.searched?
                            <>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <label htmlFor="sort" className='lbl'>Sort by:</label>
                                <select className='select text-center' name="sort" id="sort" onChange={(event)=>this.sortBy(event.target.value)}>
                                    {/*<option selected={this.state.sort_filter===null} value={null}>Select...</option>*/}
                                    <option selected={this.state.sort_filter==='relevance'} value="relevance" disabled={!this.state.searched}>Relevance (only for search query)</option>
                                    <option selected={this.state.sort_filter==='lang_en'} value="lang_en">English lang. only</option>
                                    <option selected={this.state.sort_filter==='lang_de'} value="lang_de">German lang. only</option>
                                    <option selected={this.state.sort_filter==='year_desc_ids'} value="year_desc_ids">Year Desc.</option>
                                    <option selected={this.state.sort_filter==='year_asc_ids'} value="year_asc_ids">Year Asc.</option>
                                    <option selected={this.state.sort_filter==='vs_count_desc_ids'} value="vs_count_desc_ids">Variable Sentences Count Desc.</option>
                                    <option selected={this.state.sort_filter==='vs_count_asc_ids'} value="vs_count_asc_ids">Variable Sentences Count Asc.</option>
                                    {/*<option selected={this.state.sort_filter==='best_match'} value="best_match" disabled={!this.state.searched}>Best Match</option>*/}
                                </select>
                            </> : <p></p>
                        }
                    </div>
                    {
                         loading || (this.state.actual_hits.length===0 && !this.state.searched)?
                            <div className="d-flex justify-content-center">
                                <div className="spinner-border bg-color mgn-btm" role="status">
                                    {/*<span className="sr-only">Loading...</span>*/}
                                </div>
                            </div>
                            :
                            null
                    }
                    {
                        this.state.actual_hits.length && !loading ? <div className='d-flex justify-content-center'>
                                <Table key={this.state.actual_hits.length} ssoar_docs={this.state.actual_hits}
                                       loading={loading}
                                       getParams={this.props.getParams}
                                       detailedView={!!this.props.params.id && !this.state.searched}
                                       sortFilter={this.state.sort_filter}
                                       // hitsCount = {this.state.searched?this.state.hits_count:null}
                                />
                            </div>
                            :
                                null
                    }
                    {noResult && this.state.searched && this.state.hits_count===0 && !loading? <p className='orange-clr text-center'> No Result(s) Found! Try with different id or keywords.</p> : null}
                    {
                        this.state.actual_hits.length >= 1 && !this.state.searched && !loading && !this.props.params.id ?

                            <div className="d-flex justify-content-center">
                                <span>
                                    <button type="button" className="btn btn-link bg-color" disabled={this.state.from < 5}
                                                onClick={() => this.getResults(null, this.state.from - this.state.size, this.state.size)}>&laquo; Previous
                                    </button>
                                    <b className='hits'> {this.state.from + 1} - {this.state.from + this.state.size <= this.state.hits_count? this.state.from + this.state.size : this.state.hits_count} out of {this.state.hits_count} Hits </b>
                                    <button type="button" className="btn btn-link bg-color" disabled={this.state.from + this.state.size >= this.state.hits_count}
                                            onClick={() => this.getResults(null, this.state.from + this.state.size, this.state.size)}>Next &raquo;
                                    </button>
                                </span>
                            </div>
                            :
                            this.state.searched && !loading ?
                                <div className="d-flex justify-content-center">
                                    <span>
                                        <button type="button" className="btn btn-link bg-color" disabled={this.state.from < 5}
                                                onClick={() => this.getResults(this.state.search_query, this.state.from - this.state.size, this.state.size)}>&laquo; Previous
                                        </button>
                                        <b className='hits'> {this.state.hits_count>0?this.state.from + 1:this.state.hits_count} - {this.state.from + this.state.size <= this.state.hits_count? this.state.from + this.state.size : this.state.hits_count} out of {this.state.hits_count} Hits </b>
                                        <button type="button" className="btn btn-link bg-color" disabled={this.state.from + this.state.size >= this.state.hits_count}
                                                onClick={() => this.getResults(this.state.search_query, this.state.from + this.state.size, this.state.size)}>&raquo; Next
                                        </button>
                                    </span>
                                </div>
                                :
                                !loading && this.state.actual_hits.length > 0 ?
                                    <div className="d-flex justify-content-center">
                                        <button type="button" className="btn btn-link bg-color"
                                                onClick={() => this.props.getParams(null)}>&laquo; Back
                                                {/*onClick={() => this.navigateBack()}>&laquo; Back*/}
                                        </button>
                                    </div>
                                    :
                                    null
                    }
                    </div>
                </div>
            </>
        );
    }
}

export default withParams(Home);
