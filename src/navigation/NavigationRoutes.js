// Tab Routes
import MainHome from '../containers/tabbar/main/HomeTab';
import LeaveTab from '../containers/tabbar/main/LeaveTab';
import ViewLeaves from '../containers/tabbar/main/ViewLeaves';

import TaskTab from '../containers/tabbar/taskList/TaskTab';
import Auth from './Type/AuthStack';
// // Screens Route
import Splash from '../containers/auth/Splash';
import WelcomeScreen from '../containers/WelcomeScreen';
import OnBoarding from '../containers/OnBoarding';
import Login from '../containers/auth/Login';
import TabBar from './Type/TabBarNavigation';
import Connect from '../containers/auth/Connect';
import SelfieWithId from '../containers/auth/SelfieWithId';
import HomeListCard from '../containers/tabbar/HomeListCard';


export const TabRoute = {
  MainHome,
  TaskTab,
  LeaveTab,
};

export const StackRoute = {
  WelcomeScreen,
  Splash,
  OnBoarding,
  Login,
  TabBar,
  Connect,
  SelfieWithId,
  HomeListCard,
  Auth,
};
