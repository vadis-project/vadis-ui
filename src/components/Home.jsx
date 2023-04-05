import React, {Component} from 'react';
import {useParams} from "react-router-dom";
import SearchBar from './SearchBar';
import './styles/Home.sass';
import Table from "./Table";
// import Icon from "./Icon";


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
            sort_filter: null,
            searched: false,
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
        this.getResults(null, 0, 5)
        // if(!id){this.getResults(null, 0, 5)}
    }

    sortBy(filter){
        this.setState({
            sort_filter: filter
        })
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

        if (id && !q) {
            strDocIds[0] = id
        } else if (!id && !q) {
            strDocIds = this.props.idsList.slice(from, from + size)
        }
        q = q && this.isNumeric(q) ? 'gesis-ssoar-' + q : q;
        // q = q ? this.isNumeric(q) ? 'gesis-ssoar-' + q : q.replace(/[;&/\\#,+()$~%.'":*?<>{}]/g, '') : null;
        this.setState({
            merged_results: [],
            searched: false,
        })
        // To get docs from index
        // let outcite_api_endpoint = q? this.state.outcite_ssoar_endpoint + 'q=(has_fulltext:true AND (fulltext:"' + q + '" OR title:"' + q + '" OR abstract:"' + q + '")) OR _id:"' + q + '"&from=0&size=5' : this.state.outcite_ssoar_endpoint + 'source_content_type=application/json&source={"query":{"bool":{"must":[{"term":{"has_fulltext":true}},{"exists":{"field":"abstract"}}]}}}&from=' + from + '&size=' + size
        // get doc ids from file
        let query = q && !(q.includes('gesis-ssoar-')) ?
            JSON.stringify({
                "from":0,
                "size":5,
                "query": {
                    "bool": {
                        "filter": [
                            {
                                "terms": {
                                    "_id": this.props.idsList
                                }
                            },
                            {
                                "multi_match": {
                                    "query": q,
                                    "type": "best_fields",
                                    "fields": ["title", "abstract", "fulltext"],
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
                });
                if(hits['hits']['hits'].length>0){
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
        // this.getResultsPost()
        // console.log(this.props.idsList)
        let loading = !this.state.searched && (this.state.actual_hits.length !== this.state.merged_results.length)
        let noResult = this.state.actual_hits.length === 0
        return (
            <>
                <div className='row'>
                    <div className='card'>
                        {!this.props.params.id ?
                            <div className='row mgn-top'>
                                {/*<div className='col-12'>*/}
                                {/*<div className='card'>*/}
                                <p>
                                    <span className='bg-color'><b>VADIS </b></span>
                                    is to allow for searching und using survey variables in context.
                                    It analyzes and link variables in context by identifying references to survey variables
                                    within the full text of research literature, creating semantic links based on these
                                    references and making the resulting data available as Linked Open Data.
                                </p>
                                {/*<div className='row d-flex justify-content-center'>*/}
                                {/*    <div className='col-6'>*/}
                                {/*        <ul className='margin-text'><u>How to start the process:</u>*/}
                                {/*            <li><b>First:</b> Choose a pdf file by clicking on "Choose File" button.</li>*/}
                                {/*            <li><b>Second:</b> Click on "Upload" button to start the process.</li>*/}
                                {/*            <li><b>Note:</b> After uploading a file, follow-up ID will be displayed on the*/}
                                {/*                screen. This ID is necessary for following up the results for an upload.*/}
                                {/*                So, kindly save it or bookmark a URL.*/}
                                {/*            </li>*/}
                                {/*        </ul>*/}
                                {/*    </div>*/}
                                {/*    <div className='col-6'>*/}
                                {/*        <ul className='margin-text'><u>How to check the result:</u>*/}
                                {/*            <li><b>First:</b> Enter the follow-up ID in the search bar below then click on*/}
                                {/*                "Search" button or*/}
                                {/*                directly hit the URL(displayed for the new upload) to open it up in the new*/}
                                {/*                tab.*/}
                                {/*            </li>*/}
                                {/*            <li><b>Second:</b> The search result will be displayed below on the same screen*/}
                                {/*                if it is available but you*/}
                                {/*                can also navigate to the new screen with "Get to Result" button.*/}
                                {/*            </li>*/}
                                {/*            <li><b>Note:</b> Complete extraction process will take a while,*/}
                                {/*                at least a minute for new upload, and it completely depends on the size of*/}
                                {/*                the*/}
                                {/*                file.*/}
                                {/*            </li>*/}
                                {/*            <li><b>Tip:</b> If you ever forget to save the follow-up ID or bookmark the*/}
                                {/*                result URL*/}
                                {/*                then you can also search for the results for your upload via searching for*/}
                                {/*                some unique keywords*/}
                                {/*                or strings like title, author(s) etc. of the pdf.*/}
                                {/*            </li>*/}
                                {/*        </ul>*/}
                                {/*    </div>*/}
                                {/*    <div className='col-10'>*/}
                                {/*        <em className='text-red'>Disclaimer:</em> <strong><i>Do not upload any confidential*/}
                                {/*        or private document that you*/}
                                {/*        don't want to share publicly. Result will be accessible to all users.</i></strong>*/}
                                {/*        <br/><br/>*/}
                                {/*        <div className='text-center'>*/}
                                {/*            <strong>Processed Document Example: </strong>*/}
                                {/*            <a href="https://demo-outcite.gesis.org/users/b66f4abceff160ddc6e77bc005aa8cc6"*/}
                                {/*               target='_blank'*/}
                                {/*               rel='noreferrer'>*/}
                                {/*                {"https://demo-outcite.gesis.org/users/b66f4abceff160ddc6e77bc005aa8cc6"}*/}
                                {/*            </a>*/}
                                {/*        </div>*/}
                                {/*    </div>*/}

                                {/*</div>*/}
                                {/*</div>*/}
                                {/*</div>*/}
                            </div> : null
                        }
                    <div className='d-flex justify-content-center'>
                        {/*{!this.props.params.id?*/}
                            <SearchBar placeholder={'Search by id, title or keyword(s)'} globalSearch
                                    getResults={this.getResults} from={this.state.from} size={this.state.size}/>
                            {/*:null}*/}
                        {this.state.merged_results.length>1?
                            <>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <label htmlFor="sort" className='lbl'>Sort by:</label>
                                <select className='select text-center' name="sort" id="sort" onChange={(event)=>this.sortBy(event.target.value)}>
                                    <option selected={this.state.sort_filter===null} value={null}>select...</option>
                                    <option selected={this.state.sort_filter==='year'} value="year">Year</option>
                                    <option selected={this.state.sort_filter==='linked_vars_c'} value="linked_vars_c">Linked Variables Count</option>
                                    {/*<option selected={this.state.sort_filter==='best_match'} value="best_match" disabled={!this.state.searched}>Best Match</option>*/}
                                </select>
                            </> : <p></p>
                        }
                        {/*<Icon iconName='Filter'/>*/}
                    </div>
                    {
                        this.state.merged_results.length && !loading ? <div className='d-flex justify-content-center'>
                                <Table key={this.state.merged_results.length} ssoar_docs={this.state.merged_results}
                                       loading={loading}
                                       getParams={this.props.getParams}
                                       detailedView={!!this.props.params.id && !this.state.searched}
                                       sortFilter={this.state.sort_filter}
                                />
                            </div>
                            :
                            loading ?
                                <div className="d-flex justify-content-center">
                                    <div className="spinner-border bg-color mgn-btm" role="status">
                                        {/*<span className="sr-only">Loading...</span>*/}
                                    </div>
                                </div>
                                :
                                null
                    }
                        {noResult && this.state.searched? <p className='orange-clr text-center'> No Result(s) Found!!! </p> : null}
                        {
                        this.state.merged_results.length > 1 && !this.state.searched && !loading ?
                            <div className="d-flex justify-content-center">
                                <button type="button" className="btn btn-link bg-color" disabled={this.state.from < 5}
                                        onClick={() => this.getResults(null, this.state.from - this.state.size, this.state.size)}>&laquo; Back
                                </button>
                                <button type="button" className="btn btn-link bg-color"
                                        onClick={() => this.getResults(null, this.state.from + this.state.size, this.state.size)}>Next &raquo;
                                </button>
                            </div>
                            :
                            this.state.searched && !loading ?
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
                </div>
            </>
        );
    }
}

export default withParams(Home);
