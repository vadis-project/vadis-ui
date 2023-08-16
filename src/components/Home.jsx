import React, {Component} from 'react';
import {useParams} from "react-router-dom";
import SearchBar from './SearchBar';
import './styles/Home.sass';
import Table from "./Table";
import vadisHome from '../images/vadis-home.png'

// import Icon from "./Icon";


function withParams(Component) {
    return props => <Component {...props} params={useParams()}/>;
}

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orig_ids_list: this.props.idsList['year_desc_ids'],
            merged_results: [],
            actual_hits: [],
            hits_count: null,
            from: 0,
            size: 5,
            sort_filter: 'year_desc_ids',
            searched: false,
            search_query: null,
            // vadis_app_endpoint: 'http://193.175.238.92:8000/vadis_app?ssoar_id=',
            vadis_app_endpoint: 'https://demo-vadis.gesis.org/vadis_app?ssoar_id=',
            // outcite_ssoar_endpoint: 'https://demo-outcite.gesis.org/outcite_ssoar/_search?',
            vadis_ssoar_endpoint: 'https://demo-vadis.gesis.org/vadis_ssoar/_search?',
            // outcite_ssoar_endpoint: 'http://svko-outcite.gesis.intra:9200/vadis_ssoar/_search?',
            // outcite_ssoar_endpoint: 'https://demo-vadis.gesis.org/vadis_ssoar/_search?',

        };
        this.getResults = this.getResults.bind(this)
        // this.getResultsPost = this.getResultsPost.bind(this)
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
        // const {id} = this.props.params;
        // if(!id){this.getResults(null, 0, 5)}
        // this.setState({
        //     sort_filter: 'year_desc_ids',
        //     orig_ids_list: this.props.idsList['year_desc_ids']
        // })
        this.getResults(null, 0, 5)
    }

    async sortBy(filter){
        await this.setState({
            sort_filter: filter,
            orig_ids_list: this.props.idsList[filter]
        })
        if(!this.state.searched){
            this.getResults(null, 0, this.state.size)
            // this.getResults(null, this.state.from, this.state.size)
        }

    }

    // getResultsPost(){
    //     let myHeaders = new Headers();
    //     myHeaders.append("Content-Type", "application/json");
    //
    //     let raw = JSON.stringify({
    //         "query": {
    //             "bool": {
    //                 "filter": [
    //                     {
    //                         "terms": {
    //                             "_id": this.props.idsList
    //                             // "_id": ["gesis-ssoar-19524", "gesis-ssoar-11155"]
    //                             }
    //                         },
    //                     {
    //                         "multi_match": {
    //                             "query": "social science", // string to search
    //                             "fields": ["title", "abstract"], //fields to search in
    //                             "operator": "and"
    //                     }
    //                 }]
    //             }
    //         }
    //     });
    //
    //     let requestOptions = {
    //         method: 'POST',
    //         headers: myHeaders,
    //         body: raw,
    //         redirect: 'follow'
    //     };
    //
    //     fetch("https://demo-vadis.gesis.org/vadis_ssoar/_search", requestOptions)
    //         .then(response => response.text())
    //         .then(result => console.log(result))
    //         .catch(error => console.log('error', error));
    // }
    getResults(q, from, size) {
        const {id} = this.props.params;
        let strDocIds = []
        let merged_results_list = []
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        if (id && !q)
        {
            strDocIds[0] = id
        } else if (!id && !q) {
            // strDocIds = this.state.orig_ids_list.slice(from, from + size)
            strDocIds = this.state.sort_filter === 'year_desc_ids'? this.props.idsList['year_desc_ids'].slice(from, from + size)
                : this.state.sort_filter === 'vs_count_desc_ids'? this.props.idsList['vs_count_desc_ids'].slice(from, from + size)
                : this.props.idsList['random_ids'].slice(from, from + size)
        }
        q = q && this.isNumeric(q) ? 'gesis-ssoar-' + q : q;
        // q = q ? this.isNumeric(q) ? 'gesis-ssoar-' + q : q.replace(/[;&/\\#,+()$~%.'":*?<>{}]/g, '') : null;
        this.setState({
            merged_results: [],
            searched: false,
            search_query: q
        })
        // To get docs from index
        // let outcite_api_endpoint = q? this.state.outcite_ssoar_endpoint + 'q=(has_fulltext:true AND (fulltext:"' + q + '" OR title:"' + q + '" OR abstract:"' + q + '")) OR _id:"' + q + '"&from=0&size=5' : this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"bool":{"must":[{"term":{"has_fulltext":true}},{"exists":{"field":"abstract"}}]}}}&from=' + from + '&size=' + size
        // get doc ids from file
        let query = q && !(q.includes('gesis-ssoar-')) ?
            JSON.stringify({
                "from":from,
                "size":size,
                "query": {
                    "bool": {
                        "must": [  // "filter" instead of "must" doesn't give relevance score
                            {
                                "terms": {
                                    "_id": this.state.orig_ids_list
                                }
                            },
                            {
                                "multi_match": {
                                    "query": q,
                                    "type": "best_fields",
                                    // "fields": ["title", "abstract"],
                                    "fields": ["title^3", "abstract^2", "fulltext^1"],
                                    "operator": "and"
                                }
                            }]
                    }
                }
            })
            : q && q.includes('gesis-ssoar-')? JSON.stringify({"query":{"terms":{"_id":[q]}}})
            : JSON.stringify({"query":{"terms":{"_id":strDocIds}}})
        // let outcite_api_endpoint = q && !(q.includes('gesis-ssoar-')) ? this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"bool":{"must":[{"multi_match":{"query":"'+q+'","fields":["title","fulltext"],"operator":"or"}}]}},"from":0,"size":5}'
        //                                 : q && q.includes('gesis-ssoar-')? this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"terms":{"_id":["' + q + '"]}}}'
        //                                 : this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"terms":{"_id":[' + strDocIds + ']}}}'
        let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: query,
            redirect: 'follow'
        };
        fetch(this.state.vadis_ssoar_endpoint, requestOptions)
            .then(response => response.json())
            .then(hits => {
                this.setState({
                    actual_hits: hits['hits']['hits'],
                    hits_count: hits['hits']['total']['value'],
                });
                if(hits['hits']['hits'].length > 0){
                    hits['hits']['hits'].forEach((obj, i) => {
                        if ('dates' in obj['_source'] && 'issue_date' in obj['_source']['dates']){ // issue with actual data -> renaming key 'dates' to 'date_info' to have it identical in all objects
                            obj['_source']['date_info'] = {'issue_date': obj['_source']['dates']['issue_date']}
                            delete obj['_source']['dates']

                        }
                        else if (!('dates' in obj['_source'] || 'date_info' in obj['_source'])){
                            obj['_source']['date_info'] = {'issue_date': '0000'}
                        }
                        let id_num = obj['_id'].split('-')[2]
                        // if (this.props.idsList.includes('"' + obj['_id'] + '"')){
                        fetch(this.state.vadis_app_endpoint + id_num)
                            .then(resp => resp.json())
                            .then(res => {
                                let merged_obj = {...obj, ...{'vadis_data': res}}
                                merged_results_list.push(merged_obj)
                                this.setState({
                                    from: from,
                                    size: size,
                                    searched: !!q,

                                })
                            }).catch(error => {
                            let merged_obj = {...obj, ...{'vadis_data': {'error': error}}}
                            merged_results_list.push(merged_obj)
                            this.setState({
                                from: from,
                                size: size,
                                searched: !!q,
                            })
                            console.log('error', error)
                        });
                        // }
                    })
                }
                else{
                    this.setState({
                        searched: true,

                    })
                }

            }).catch(error => console.log('error', error));
        this.setState({
            merged_results: merged_results_list,
            // merged_results: merged_results_list.sort((a,b) => (b.vadis_data.variable_sentences.length < a.vadis_data.variable_sentences.length) ? 1 : ((a.vadis_data.variable_sentences.length < b.vadis_data.variable_sentences.length) ? -1 : 0)),
        });
    }
    // getResults(q, from, size) {
    //     const {id} = this.props.params;
    //     let strDocIds = []
    //     let merged_results_list = []
    //     if (id && !q) {
    //         strDocIds[0] = '"gesis-ssoar-' + String(id) + '"'
    //     } else if (!id && !q) {
    //         strDocIds = this.props.idsList.slice(from, from + size)
    //         // docIds.forEach((id, i) => {
    //         //     strDocIds[i] = '"gesis-ssoar-' + String(id) + '"'
    //         // });
    //     }
    //     q = q && this.isNumeric(q) ? 'gesis-ssoar-' + q : q;
    //     // q = q ? this.isNumeric(q) ? 'gesis-ssoar-' + q : q.replace(/[;&/\\#,+()$~%.'":*?<>{}]/g, '') : null;
    //     this.setState({
    //         merged_results: [],
    //         searched: false,
    //     })
    //     // To get docs from index
    //     // let outcite_api_endpoint = q? this.state.outcite_ssoar_endpoint + 'q=(has_fulltext:true AND (fulltext:"' + q + '" OR title:"' + q + '" OR abstract:"' + q + '")) OR _id:"' + q + '"&from=0&size=5' : this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"bool":{"must":[{"term":{"has_fulltext":true}},{"exists":{"field":"abstract"}}]}}}&from=' + from + '&size=' + size
    //     // get doc ids from file
    //     let outcite_api_endpoint = q && !(q.includes('gesis-ssoar-')) ? this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"bool":{"must":[{"multi_match":{"query":"'+q+'","fields":["title","fulltext"],"operator":"or"}}]}},"from":0,"size":5}'
    //                                     : q && q.includes('gesis-ssoar-')? this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"terms":{"_id":["' + q + '"]}}}'
    //                                     : this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"terms":{"_id":[' + strDocIds + ']}}}'
    //     // let outcite_api_endpoint = q ? this.state.outcite_ssoar_endpoint + 'q=(has_fulltext:true AND (fulltext:"' + q + '" OR title:"' + q + '" OR abstract:"' + q + '")) OR _id:"' + q + '"&from=0&size=5' : this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"terms":{"_id":[' + strDocIds + ']}}}'
    //     fetch(outcite_api_endpoint)
    //         .then(response => response.json())
    //         .then(hits => {
    //             this.setState({
    //                 actual_hits: hits['hits']['hits'],
    //             });
    //             hits['hits']['hits'].forEach((obj, i) => {
    //                 if ('dates' in obj['_source'] && 'issue_date' in obj['_source']['dates']){ // issue with actual data -> renaming key 'dates' to 'date_info' to have it identical in all objects
    //                     obj['_source']['date_info'] = {'issue_date': obj['_source']['dates']['issue_date']}
    //                     delete obj['_source']['dates']
    //
    //                 }
    //                 else if (!('dates' in obj['_source'] || 'date_info' in obj['_source'])){
    //                     obj['_source']['date_info'] = {'issue_date': '0000'}
    //                 }
    //                 let id_num = obj['_id'].split('-')[2]
    //                 // if (this.props.idsList.includes('"' + obj['_id'] + '"')){
    //                     fetch(this.state.vadis_app_endpoint + id_num)
    //                         .then(resp => resp.json())
    //                         .then(res => {
    //                             let merged_obj = {...obj, ...{'vadis_data': res}}
    //                             merged_results_list.push(merged_obj)
    //                             this.setState({
    //                                 from: from,
    //                                 size: size,
    //                                 searched: !!q,
    //
    //                             })
    //                         }).catch(error => {
    //                         let merged_obj = {...obj, ...{'vadis_data': {'error': error}}}
    //                         merged_results_list.push(merged_obj)
    //                         this.setState({
    //                             from: from,
    //                             size: size,
    //                             searched: !!q,
    //                         })
    //                         console.log('error', error)
    //                     });
    //                 // }
    //             })
    //         }).catch(error => console.log('error', error));
    //     this.setState({
    //         merged_results: merged_results_list,
    //         // merged_results: merged_results_list.sort((a,b) => (b.vadis_data.variable_sentences.length < a.vadis_data.variable_sentences.length) ? 1 : ((a.vadis_data.variable_sentences.length < b.vadis_data.variable_sentences.length) ? -1 : 0)),
    //     });
    // }

    render() {
        let loading = !this.state.hits_count && !this.state.searched && (this.state.actual_hits.length !== this.state.merged_results.length)
        let noResult = this.state.hits_count === 0 && this.state.searched
        if(this.state.sort_filter==='random_ids' && !this.state.search_query) // update filter to 'year' if the search query gets cleared while 'relevance' selected as filter
        {
            this.sortBy('year_desc_ids')
        }


        // let noResult = this.state.actual_hits.length === 0
        return (
            <>
                <div className='row'>
                    <div className='card'>
                        {!this.props.params.id ?
                            <div className='row mgn-top'>
                                <p className='col-9 padding-text'>
                                    Welcome to the search demo of the&nbsp;
                                    {/*<span className='bg-color'><b>VADIS project </b></span> */}
                                    <a className='bg-color'
                                        href='https://vadis-project.github.io/'
                                        target='_blank'
                                        rel='noreferrer'>
                                        <b>VADIS</b>
                                    </a>
                                    &nbsp;project (VAriable Detection, Interlinking and Summarization).
                                    Starting with classical document search, it allows for searching and discovering survey variables in context of scholarly publications. The key idea of the VADIS project is to identify references to survey variables within the full text of research literature, creating semantic links based on these references and making the resulting data available.
                                </p>
                                <img className='col-3 img-home' src={vadisHome} alt=''/>
                            </div> : null
                        }
                    <div className='d-flex justify-content-center'>
                        {this.state.merged_results.length>0? <p className='lbl'><b> {this.state.searched || this.props.params.id ? this.state.hits_count : this.state.orig_ids_list.length} Hit(s) </b>&nbsp;&nbsp;&nbsp;</p> : null}
                        {/*{!this.props.params.id?*/}
                            <SearchBar placeholder={'Search by id, title or keyword(s)'} globalSearch
                                    getResults={this.getResults} from={0} size={this.state.size}/>
                            {/*:null}*/}
                        {this.state.merged_results.length>1?
                            <>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <label htmlFor="sort" className='lbl'>Sort by:</label>
                                <select className='select text-center' name="sort" id="sort" onChange={(event)=>this.sortBy(event.target.value)}>
                                    {/*<option selected={this.state.sort_filter===null} value={null}>Select...</option>*/}
                                    <option selected={this.state.sort_filter==='random_ids'} value="random_ids" disabled={!this.state.searched}>Relevance</option>
                                    <option selected={this.state.sort_filter==='year_desc_ids'} value="year_desc_ids">Year</option>
                                    <option selected={this.state.sort_filter==='vs_count_desc_ids'} value="vs_count_desc_ids">Linked Variables Count</option>
                                    {/*<option selected={this.state.sort_filter==='best_match'} value="best_match" disabled={!this.state.searched}>Best Match</option>*/}
                                </select>
                            </> : <p></p>
                        }
                        {/*<Icon iconName='Filter'/>*/}
                    </div>
                    {
                         loading || (this.state.merged_results.length===0 && !this.state.searched)?
                            <div className="d-flex justify-content-center">
                                <div className="spinner-border bg-color mgn-btm" role="status">
                                    {/*<span className="sr-only">Loading...</span>*/}
                                </div>
                            </div>
                            :
                            null
                    }
                    {
                        this.state.merged_results.length && !loading ? <div className='d-flex justify-content-center'>
                                <Table key={this.state.merged_results.length} ssoar_docs={this.state.merged_results}
                                       loading={loading}
                                       getParams={this.props.getParams}
                                       detailedView={!!this.props.params.id && !this.state.searched}
                                       sortFilter={this.state.sort_filter}
                                       // hitsCount = {this.state.searched?this.state.hits_count:null}
                                />
                            </div>
                            :
                            // loading ?
                            //     <div className="d-flex justify-content-center">
                            //         <div className="spinner-border bg-color mgn-btm" role="status">
                            //             {/*<span className="sr-only">Loading...</span>*/}
                            //         </div>
                            //     </div>
                            //     :
                                null
                    }
                    {noResult && this.state.searched && this.state.hits_count===0 && !loading? <p className='orange-clr text-center'> No Result(s) Found! Try with different id or keywords.</p> : null}
                    {
                        this.state.merged_results.length >= 1 && !this.state.searched && !loading && !this.props.params.id ?

                            <div className="d-flex justify-content-center">
                                <span>
                                    <button type="button" className="btn btn-link bg-color" disabled={this.state.from < 5}
                                                onClick={() => this.getResults(null, this.state.from - this.state.size, this.state.size)}>&laquo; Previous
                                    </button>
                                    <b className='hits'> {this.state.from + 1} - {this.state.from + this.state.size <= this.state.orig_ids_list.length? this.state.from + this.state.size : this.state.orig_ids_list.length} out of {this.state.orig_ids_list.length} Hits </b>
                                    <button type="button" className="btn btn-link bg-color" disabled={this.state.from + this.state.size >= this.state.orig_ids_list.length}
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
                </div>
            </>
        );
    }
}

export default withParams(Home);
