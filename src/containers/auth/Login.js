// Library Imports
import {StyleSheet, View, TouchableOpacity, Alert,Image} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Local Imports
import strings from '../../i18n/strings';
import {styles} from '../../themes';
import { getHeight, moderateScale} from '../../common/constants';
import EHeader from '../../components/common/EHeader';
import ESafeAreaView from '../../components/common/ESafeAreaView';
// import { AppFavicon } from '../../assets/svgs';
import AppLogo from '../../assets/images/appFavicon.png'; // adjust the path as needed

import EInput from '../../components/common/EInput';
import {validateEmail} from '../../utils/validators';
import KeyBoardAvoidWrapper from '../../components/common/KeyBoardAvoidWrapper';
import EButton from '../../components/common/EButton';
import api from '../../api/api';
import AuthContext from "../../navigation/Type/Auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EText from '../../components/common/EText';

const Login = () => {
  const colors = useSelector(state => state.theme.theme);

  const BlurredStyle = {
    backgroundColor: colors.inputBg,
  };
  const FocusedStyle = {
    backgroundColor: colors.inputFocusColor,
    borderColor: colors.primary5,
  };

  const BlurredIconStyle = colors.grayScale5;
  const FocusedIconStyle = colors.primary5;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailIcon, setEmailIcon] = useState(BlurredIconStyle);
  const [passwordIcon, setPasswordIcon] = useState(BlurredIconStyle);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [emailInputStyle, setEmailInputStyle] = useState(BlurredStyle);
  const [passwordInputStyle, setPasswordInputStyle] = useState(BlurredStyle);
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);
  const { signIn } = useContext(AuthContext)

  const onFocusInput = onHighlight => onHighlight(FocusedStyle);
  const onFocusIcon = onHighlight => onHighlight(FocusedIconStyle);
  const onBlurInput = onUnHighlight => onUnHighlight(BlurredStyle);
  const onBlurIcon = onUnHighlight => onUnHighlight(BlurredIconStyle);

  useEffect(() => {
    if (
      email.length > 0 &&
      password.length > 0 &&
      !emailError &&
      !passwordError
    ) {
      setIsSubmitDisabled(false);
    } else {
      setIsSubmitDisabled(true);
    }
  }, [email, password, emailError, passwordError]);

  const onChangedEmail = val => {
    const {msg} = validateEmail(val.trim());
    setEmail(val.trim());
    setEmailError(msg);
  };
  const onChangedPassword = val => {
    // const {msg} = validatePassword(val.trim());
    setPassword(val.trim());
    // setPasswordError(msg);
  };

  const EmailIcon = () => {
    return <Ionicons name="mail" size={moderateScale(20)} color={emailIcon} />;
  };

  const onFocusEmail = () => {
    onFocusInput(setEmailInputStyle);
    onFocusIcon(setEmailIcon);
  };
  const onBlurEmail = () => {
    onBlurInput(setEmailInputStyle);
    onBlurIcon(setEmailIcon);
  };

  const PasswordIcon = () => (
    <Ionicons
      name="lock-closed"
      size={moderateScale(20)}
      color={passwordIcon}
    />
  );

  const onFocusPassword = () => {
    onFocusInput(setPasswordInputStyle);
    onFocusIcon(setPasswordIcon);
  };
  const onBlurPassword = () => {
    onBlurInput(setPasswordInputStyle);
    onBlurIcon(setPasswordIcon);
  };
  const RightPasswordEyeIcon = () => (
    <TouchableOpacity
      onPress={onPressPasswordEyeIcon}
      style={localStyles.eyeIconContainer}>
      <Ionicons
        name={isPasswordVisible ? 'eye-off' : 'eye'}
        size={moderateScale(20)}
        color={passwordIcon}
      />
    </TouchableOpacity>
  );

  const onPressSignWithPassword = async () => {
    api.post('/api/login', {
      email:email,
      password:password
    }).then(async(res) => { 
      console.log(res.data.data)
      if (res && res.data.msg === 'Success') {
        await AsyncStorage.setItem('USER_TOKEN','loggedin')
        await AsyncStorage.setItem('USER',JSON.stringify(res.data.data))
        signIn('124')  
      } else {
        Alert.alert('Invalid Credentials')
      }
    }).catch(()=>{
      Alert.alert('Invalid Credentials')
    })
  };


  const onPressPasswordEyeIcon = () => setIsPasswordVisible(!isPasswordVisible);


  return (
    <ESafeAreaView style={localStyles.root}>
      <EHeader isHideBack/>
        <KeyBoardAvoidWrapper contentContainerStyle={{flex:1}}>

        <View style={localStyles.mainContainer}>

          <View style={[{flex:2}]}>
          <Image
            source={AppLogo}
            style={[localStyles.logoImage, styles.mv20, styles.selfCenter]}
          />

          </View>
         
          <View style={[localStyles.loginBg,{flex:3}]}>
         
            <EText type="B35" numberOfLines={1} color={colors.textColor}  style={[styles.mv20, styles.selfCenter]}>
            Login
            </EText>

            <EInput
              placeHolder={strings.email}
              keyBoardType={'email-address'}
              _value={email}
              _errorText={emailError}
              autoCapitalize={'none'}
              insideLeftIcon={() => <EmailIcon />}
              toGetTextFieldValue={onChangedEmail}
              inputContainerStyle={[
                {backgroundColor: colors.inputBg},
                localStyles.inputContainerStyle,
                emailInputStyle,
              ]}
              inputBoxStyle={[localStyles.inputBoxStyle]}
              _onFocus={onFocusEmail}
              onBlur={onBlurEmail}
            />

            <EInput
              placeHolder={strings.password}
              keyBoardType={'default'}
              _value={password}
              _errorText={passwordError}
              autoCapitalize={'none'}
              insideLeftIcon={() => <PasswordIcon />}
              toGetTextFieldValue={onChangedPassword}
              inputContainerStyle={[
                {backgroundColor: colors.inputBg},
                localStyles.inputContainerStyle,
                passwordInputStyle,
              ]}
              _isSecure={isPasswordVisible}
              inputBoxStyle={[localStyles.inputBoxStyle]}
              _onFocus={onFocusPassword}
              onBlur={onBlurPassword}
              rightAccessory={() => <RightPasswordEyeIcon />}
            />

            <EButton
              title={strings.signIn}
              type={'S16'}
              color={isSubmitDisabled && colors.white}
              containerStyle={localStyles.signBtnContainer}
              onPress={onPressSignWithPassword}
              bgColor={isSubmitDisabled && colors.backgroundColor3}
            />

          </View>
        </View>


        </KeyBoardAvoidWrapper>
       
    
    </ESafeAreaView>
  );
};

export default Login;

const localStyles = StyleSheet.create({
  mainContainer: {
   flex:1,
   justifyContent:'center'
  },
  divider: {
    ...styles.rowCenter,
    ...styles.mv30,
  },
  orContainer: {
    height: getHeight(1),
    width: '30%',
  },
  signBtnContainer: {
    ...styles.center,
    width: '100%',
    ...styles.mv20,
  },
  logoImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  
  signUpContainer: {
    ...styles.rowCenter,
    ...styles.mv10,
  },
  inputContainerStyle: {
    height: getHeight(60),
    borderRadius: moderateScale(15),
    borderWidth: moderateScale(1),
    ...styles.ph15,
  },
  inputBoxStyle: {
    ...styles.ph15,
  },
  checkboxContainer: {
    ...styles.rowCenter,
    ...styles.mb20,
  },
  socialBtnContainer: {
    ...styles.rowCenter,
    ...styles.mv20,
  },
  socialBtn: {
    ...styles.center,
    height: getHeight(60),
    width: moderateScale(90),
    borderRadius: moderateScale(15),
    borderWidth: moderateScale(1),
    ...styles.mh10,
  },
  root:{
    flex:1,
    justifyContent:'center',
    flexDirection:'column',
   alignContent:'center',
    backgroundColor:'#004AAD',
  },
  logoBg:{
    backgroundColor:"#fff",
    borderRadius:20,
  },
  loginBg:{
    backgroundColor:"#fff",
    ...styles.ph20,
    borderTopRightRadius:100,
    paddingTop:50
  }
});
