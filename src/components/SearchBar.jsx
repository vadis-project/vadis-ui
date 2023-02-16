import {Component} from "react";
import './styles/SearchBar.sass'

class SearchBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            input: null,
        };
        this.handleChange = this.handleChange.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
        // this.isNumeric = this.isNumeric.bind(this)
    }

    handleChange(e) {
        this.setState({input: e.target.value});
    }

    // isNumeric(value) {
    //     return /^\d+$/.test(value);
    // }

    handleKeyDown = (e) => {
        if (e.key === 'Enter' && this.state.input && this.props.globalSearch) {
            this.props.getResults(this.state.input, this.props.from, this.props.size)
        }
    }

    render() {
        return <div className="input-group input-group-sm mb-3 w-50 padding">
            <input type="search" className="form-control rounded" placeholder={this.props.placeholder}
                   aria-label="Search"
                   aria-describedby="search-addon" onChange={this.handleChange} onKeyDown={this.handleKeyDown}/>
            <button type="button" className="btn btn-outline-primary"
                    // disabled={!this.props.loading.every(element => element === false)}
                    onClick={() =>
                this.state.input && this.props.globalSearch ?
                    // this.isNumeric(this.state.input) ? this.props.getResults('gesis-ssoar-' + this.state.input, this.props.from, this.props.size)
                    //     : this.props.getResults(this.state.input, this.props.from, this.props.size)
                         this.props.getResults(this.state.input, this.props.from, this.props.size)
                    :
                    null
            }
            >search
            </button>
        </div>;

    }
}

export default SearchBar;