import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StackRoute} from '../NavigationRoutes';
import {StackNav} from '../NavigationKeys';
import AuthStack from './AuthStack';
import AuthContext, {defaultState, reducer, restoreToken} from './Auth';
import ViewLeaves from '../../containers/tabbar/main/ViewLeaves';


const Stack = createNativeStackNavigator();

export default function StackNavigation() {
  const [state, dispatch] = React.useReducer(reducer, defaultState);

  React.useEffect(() => {
    restoreToken(dispatch);
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: data => dispatch({type: 'SIGN_IN', token: data}),
      signOut: () => dispatch({type: 'SIGN_OUT'}),
      signUp: data => dispatch({type: 'SIGN_IN', token: data}),
    }),
    [],
  );

  return (
    <AuthContext.Provider value={authContext}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {state.isLoading ? (
          <Stack.Screen name={StackNav.Splash} component={StackRoute.Splash} />
        ) : state.userToken == null ? (
          <Stack.Screen name={StackNav.Auth} component={AuthStack} />
        ) : (
          <>
          <Stack.Screen name={StackNav.TabBar} component={StackRoute.TabBar} />
          <Stack.Screen name={StackNav.ViewLeaves} component={ViewLeaves} />
          </>
        )}
      </Stack.Navigator>
    </AuthContext.Provider>
  );
}
