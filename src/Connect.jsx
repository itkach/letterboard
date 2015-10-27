import React from 'react';

export default class extends React.Component {

  constructor({to}) {
    super();
    let state = {};

    for (let [store, name] of to) {
      if (store.getInitialState) {
        const initialState = store.getInitialState();
        if (name) {
          state[name] = {...initialState};
        }
        else {
          state = {...state, ...initialState};
        }
      }
    }
    this.unsubscribe = [];
    this.state = state;
  }

  componentWillMount() {
    for (let [store, name] of this.props.to) {
      this.unsubscribe.push(
        store.listen(data => this.onDataChange(name, data))
      );
    }
  }

  componentWillUnmount() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe());
  }

  onDataChange(name, data) {
    if (name) {
      this.setState({[name]: data});
    }
    else {
      this.setState({...data});
    }
  }

  render() {
    const {component, to, ...rest} = this.props,
    Component = component;
    return <Component {...this.state} {...rest} />;
  }
}
