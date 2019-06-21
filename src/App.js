import React from 'react';
import Particles from 'react-particles-js';
import particlesOptions from "./components/Particles/particlesjs-config.json";
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";


// const particlesOptions = {
//   particles: {
//       line_linked: {
//         shadow: {
//           enable: true,
//           color: "#3CA9D1",
//           blur: 5
//         }
//       }
//     }
//   };



const initialState = {
  input : '',
  imageURL : '',
  box : {},
  route : 'sign_in',
  isSignedIn : false,
  user : {
    id : '',
    name : '',
    email : '',
    password : '',
    entries : 0,
    joind : ''
  }
};

class App extends React.Component {
  
  constructor() {
    super();
    this.state = initialState;
  }

  componentDidMount() {
    fetch('http://localhost:3000/')
      .then(response => response.json())
      .then(console.log);
  }
   
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width,height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    };
  }

  displayFaceBox (box) {
    console.log(box);
    this.setState({box : box});
  }

  onInputChange = (event) => {
    this.setState({input : event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageURL : this.state.input});
    // fetch clarifai from backend
    fetch('http://localhost:3000/image_url', {
      method : 'post',
      headers : {'Content-Type' : 'application/json'},
      body : JSON.stringify({input : this.state.input})
    })
    .then(response => response.json())
    .then( response => {
      if(response){
        fetch('http://localhost:3000/image', {
            method : 'put',
            headers : {'Content-Type' : 'application/json'},
            body : JSON.stringify({
            "id" : this.state.user.id
            })
        })
        .then(response => response.json())
        .then(count => {
            this.setState(Object.assign(this.state.user, {entries : count}));
        })
        .catch(console.log);
      }
      this.displayFaceBox(this.calculateFaceLocation(response));
      })
    .catch(err => console.log(err)); 
  }

  onRouteChange = (route) => {
    if(route === 'sign_out'){
      this.setState(initialState);
    }else if (route === 'home'){
      this.setState({isSignedIn : true});
    }
    this.setState({route : route});
  }

  loadUser = (user) => {
    this.setState({user : user});
  }

  render(){
    const {imageURL, box, route, isSignedIn, user} = this.state;

    let a ;
    switch (route) {
      case 'sign_in':
        a = <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        break;
      case 'home':
          a = <div>
                <Logo /> 
                <Rank user={user} />
                <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit= {this.onButtonSubmit}/>
                <FaceRecognition box = {box} imageURL={imageURL} />
              </div>
        break;
      case 'register':
          a = <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        break;
      default:
          a = <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        break;
    } 

    return (
      <div className="App">
        <Particles className='particles' 
          params={particlesOptions}/>
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
        { 
          a
          /*this.state.route === 'sign_in' ?
            <SignIn onRouteChange={this.onRouteChange} /> :
            <div>
              <Logo /> 
              <Rank />
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
              <FaceRecognition box = {this.state.box} imageURL={this.state.imageURL} />
            </div>*/
        }
      </div>
    );
  }
}

export default App;
