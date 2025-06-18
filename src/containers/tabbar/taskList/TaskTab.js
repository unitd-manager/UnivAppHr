import {StyleSheet, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {FlashList} from '@shopify/flash-list';
import filter from 'lodash/filter';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SearchComponent from '../../../components/homeComponent/SearchComponent';
import {styles} from '../../../themes';
import strings from '../../../i18n/strings';
import ListData from './ListData';
import EHeader from '../../../components/common/EHeader';
import api from '../../../api/api';

export default function TaskTab({route}) {
  const colors = useSelector(state => state.theme.theme);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fullData, setFullData] = useState([]);
  const [searchProject, setSearchProject] = useState('');
  const [extraData, setExtraData] = useState(true);
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const storedUser = await AsyncStorage.getItem('USER');
    setUser(JSON.parse(storedUser));
  };

  const fetchData = async () => {
    try {
      const res = await api.get('/attendance/getEmployeeData');
      const filtered = res.data.data.filter(i => i.staff_id === user?.staff_id);
      setData(filtered);
      setFullData(filtered);
    } catch (err) {
      alert('Network connection error.');
      setError(err.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (route.params && route.params.insertedData && user) {
      fetchData();
    }
  }, [route.params]);

  const handleSearch = query => {
    setSearchProject(query);
    const filteredData = filter(fullData, user => contains(user, query));
    setData(filteredData);
  };

  const contains = ({title}, query) =>
    title?.toLowerCase().includes(query.toLowerCase());

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderVerticalItem = ({item}) => <ListData item={item} user={user} />;

  return (
    <View style={[styles.flexGrow1, {backgroundColor: '#F5F5F5'}]}>
      <View style={{backgroundColor: colors.backgroundColor3}}>
        <EHeader title={strings.TaskList} />
        {/* Optional Search */}
        {/* <SearchComponent
          search={searchProject}
          onSearchInput={handleSearch}
          isLoading={isLoading}
          error={error}
          style={{marginTop: -20}}
        /> */}
      </View>

      <FlashList
        data={data}
        renderItem={renderVerticalItem}
        keyExtractor={(item, index) => index.toString()}
        estimatedItemSize={160} // more accurate
        contentContainerStyle={localStyles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  contentContainerStyle: {
    ...styles.ph20,
    ...styles.pb10,
  },
});
