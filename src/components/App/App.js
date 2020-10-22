import React from 'react';
import './App.css';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import { HomePage } from '../HomePage/HomePage';
import { AddSpot } from '../AddSpot/AddSpot';
import {  Route, Switch } from 'react-router-dom';
import { SearchMenu } from '../SearchMenu/SearchMenu';
import { Error } from '../Error/Error';
import { SpotPage } from '../SpotPage/SpotPage';
import { FormSuccessOverlay } from '../FormSuccessOverlay/FormSuccessOverlay';
import '../root.scss';
import SignIn from '../SignIn/SignIn';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isHome: true,
      isMobile: false,
      locationDetected: true,
      apiResponse: '',
      user: {
        displayName: 'Anonyme',
        fname: 'undefined',
        lname: 'undefined',
        uid: 'undefined',
        email: 'undefined',
        profilPicture: 'undefined', //should be a placeholder one
        signUpDate: 'undefined',

      }
    };
  this.whatSize = this.whatSize.bind(this);
  };

 
  whatSize(){
    let wid = window.innerWidth;
    console.log(wid);
    if (wid > 500 && this.state.isMobile === true){
      this.setState({isMobile: false});
    } else if(wid <= 500 && this.state.isMobile === false){
      this.setState({isMobile: true});
    }
  }

  componentDidMount(){
    window.addEventListener("resize", this.whatSize);
  }

  componentDidUpdate(){
    // console.log('mount towards: ',window.location.pathname, ' state is: ', this.state.isHome);

   

  }
 

  render() {
// To ally server and client side routing, please refer to https://stackoverflow.com/questions/27928372/react-router-urls-dont-work-when-refreshing-or-writing-manually
  if (window.location.pathname === '/' && this.state.isHome === false) {
      this.setState({isHome: true});
    } else if (window.location.pathname !== '/' && this.state.isHome === true){
      this.setState({isHome: false});
    }
  // console.log(window.location.pathname);
return (
      <div >
        
        <Header isMobile={this.state.isMobile}
          isHome={this.state.isHome} />
        <main>
          <Switch>
            <Route exact path='/' render={(props) =>
              <HomePage {...props} locationDetected={this.state.locationDetected} />}
               />
              <Route path='/form-successfully-submited' component={FormSuccessOverlay} />
            <Route path='/search' component={SearchMenu} />
            <Route path='/sign-in' component={SignIn} />
            <Route path='/result' component={SpotPage} />
            <Route path='/add-spot' render={(props) =>
              <AddSpot {...props} userInfo={this.state.user} />} />

            <Route component={Error} />
          </Switch>
        </main>
        <Footer />
      </div>

    );
  }
}
export default App;