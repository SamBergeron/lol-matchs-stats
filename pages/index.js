import "../node_modules/bootstrap/dist/css/bootstrap.css";
import Link from 'next/link'
import React from 'react'

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            href: '',
            placeholder: 'Summoner name'
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        console.log('Hi');
        console.log(event.target.value);
        this.setState({
            value: event.target.value,
            href: `/s/${event.target.value}`
        });
    }

    render() {
        return (
            <div class="container-fluid">
                <section class="jumbotron text-center" style={{marginTop: 50+'px'}}>
                    <div class="container">
                        <h1 class="jumbotron-heading">League of legends demo stats app</h1>
                        <p class="lead text-muted">
                            Enter your summoner name to see your latest match statistics
                        </p>
                        <p>
                            <div class="col-4 offset-4">
                                <div class="input-group">
                                    <input placeholder={this.state.placeholder} type="text" class="form-control" onChange={this.handleChange}/>
                                    <div class="input-group-append">
                                        <Link href={this.state.href}>
                                            <button class="btn btn-outline-primary">Search</button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </p>
                    </div>
                </section>
            </div>
        )
    }
}

export default Index;
