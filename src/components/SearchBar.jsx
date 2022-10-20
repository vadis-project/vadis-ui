import {Component} from "react";
import './styles/SearchBar.sass'

class SearchBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            input: null,
        };
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(e) {
        this.setState({input: e.target.value});
    }

    render() {
        return <div className="input-group input-group-sm mb-3 w-50 padding">
            <input type="search" className="form-control rounded" placeholder={this.props.placeholder}
                   aria-label="Search"
                   aria-describedby="search-addon" onChange={this.handleChange}/>
            <button type="button" className="btn btn-outline-primary" onClick={() =>
                this.state.input && this.props.globalSearch ?
                    this.props.getResults('gesis-ssoar-' + this.state.input, this.props.from, this.props.size)
            :
                null
            }
            >search
            </button>
        </div>;

    }
}

export default SearchBar;