/*This is an Example of Facebook Login*/
import React, { Component } from 'react';
import { View, StyleSheet, Text, Alert, Image } from 'react-native';
import {
  LoginButton,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-community/google-signin';

export default class App extends Component {
  constructor() {
    super();
    //Setting the state for the data after login
    this.state = {
      user_name: '',
      token: '',
      profile_pic: '',
    };
  }

  get_Response_Info = (error, result) => {
    if (error) {
      //Alert for the Error
      Alert.alert('Error fetching data: ' + error.toString());
    } else {
      //response alert
      alert(JSON.stringify(result));
      this.setState({ user_name: 'Welcome' + ' ' + result.name });
      this.setState({ token: 'User Token: ' + ' ' + result.id });
      this.setState({ profile_pic: result.picture.data.url });
    }
  };
  _signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.warn(userInfo);
      alert(userInfo);
      this.setState({ user_name: 'Welcome' + ' ' + userInfo.user.name });
      this.setState({ token: 'User Token: ' + ' ' + userInfo.user.id });
      this.setState({ profile_pic: userInfo.user.photo });
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
      console.log(error)
    }
  };

  onLogout = () => {
    //Clear the state after logout
    this.setState({ user_name: null, token: null, profile_pic: null });
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.profile_pic ? (
          <Image
            source={{ uri: this.state.profile_pic }}
            style={styles.imageStyle}
          />
        ) : null}
        <Text style={styles.text}> {this.state.user_name} </Text>
        <Text> {this.state.token} </Text>

        <LoginButton
          readPermissions={['public_profile']}
          onLoginFinished={(error, result) => {
            if (error) {
              alert(error);
              alert('login has error: ' + result.error);
            } else if (result.isCancelled) {
              alert('login is cancelled.');
            } else {
              AccessToken.getCurrentAccessToken().then(data => {
                alert(data.accessToken.toString());
                console.warn(data)
                const processRequest = new GraphRequest(
                  '/me?fields=name,picture.type(large)',
                  null,
                  this.get_Response_Info
                );
                // Start the graph request.
                new GraphRequestManager().addRequest(processRequest).start();
              });
            }
          }}
          onLogoutFinished={this.onLogout}
        />
        <GoogleSigninButton
          style={{ width: 192, height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={this._signIn}
          disabled={this.state.isSigninInProgress} 
          onLogoutFinished={this.onLogout}/>
      </View>
    );
  }
  componentWillMount(){
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
      webClientId: '174851680298-jkbnjclicjcj15kjqsb9rk5crg8dercc.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
      // hostedDomain: '', // specifies a hosted domain restriction
      // loginHint: '', // [iOS] The user's ID, or email address, to be prefilled in the authentication UI if possible. [See docs here](https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd)
      forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
      // accountName: '', // [Android] specifies an account name on the device that should be used
      //iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] optional, if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    padding: 20,
  },
  imageStyle: {
    width: 200,
    height: 300,
    resizeMode: 'contain',
  },
});