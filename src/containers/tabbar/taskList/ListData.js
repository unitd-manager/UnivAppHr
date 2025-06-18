import {StyleSheet, View, Text} from 'react-native';
import React, {memo, useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EText from '../../../components/common/EText';
import {commonColor, styles} from '../../../themes';
import {moderateScale} from '../../../common/constants';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Feather';

const ListData = ({item}) => {
  const colors = useSelector(state => state.theme.theme);
  const [user, setUserData] = useState();

  useEffect(() => {
    const getUser = async () => {
      let userData = await AsyncStorage.getItem('USER');
      setUserData(JSON.parse(userData));
    };
    getUser();
  }, []);

  const calculateTotalTime = (startTime, endTime) => {
    if (!startTime || !endTime) return '00:00:00';
    const start = moment(startTime, 'h:mm:ss a');
    const end = moment(endTime, 'h:mm:ss a');
    const duration = moment.duration(end.diff(start));
    return [
      Math.floor(duration.asHours()).toString().padStart(2, '0'),
      (duration.minutes()).toString().padStart(2, '0'),
      (duration.seconds()).toString().padStart(2, '0')
    ].join(':');
  };

  if (!user || user.staff_id !== item.staff_id) return null; // ✅ replaced '' with null

  return (
    <View style={[localStyles.innerContainer, {backgroundColor: colors.dark ? colors.dark2 : colors.grayScale1}]}>
      <View style={localStyles.project}>
        <View>
          <Text style={localStyles.heading}></Text>
          <Text style={localStyles.subHeading}>{item?.date}</Text>
        </View>
        <View>
          {!item?.day_check_in_time ? (
            <Icon name="moon" size={20} color="#009EFF" />
          ) : (
            <Icon name="sun" size={20} color="#FFA500" />
          )}
        </View>
      </View>

      <View style={localStyles.time}>
        <View>
          <Text style={localStyles.subHeading}>
            {!item?.day_check_in_time ? 'Night Check In' : 'Day Check In'}
          </Text>
          <Text style={[localStyles.subHeading, {color: '#009EFF'}]}>
            {item?.day_check_in_time || item?.night_check_In_time}
          </Text>
        </View>

        <View style={localStyles.verticalLine} />

        <View>
          <Text style={localStyles.subHeading}>
            {!item?.day_check_in_time ? 'Night Check Out' : 'Day Check Out'}
          </Text>
          <Text style={[localStyles.subHeading, {color: '#009EFF'}]}>
            {item?.day_check_out_time || item?.night_check_out_time}
          </Text>
        </View>

        <View style={localStyles.verticalLine} />

        <View>
          <Text style={localStyles.subHeading}>Working Hrs</Text>
          <Text style={[localStyles.subHeading, {color: '#009EFF'}]}>
            {!item?.day_check_in_time
              ? calculateTotalTime(item?.night_check_In_time, item?.night_check_out_time)
              : calculateTotalTime(item?.day_check_in_time, item?.day_check_out_time)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default memo(ListData);

const localStyles = StyleSheet.create({
  innerContainer: {
    ...styles.mv10,
    borderRadius: moderateScale(12),
    ...styles.shadowStyle,
    minHeight: 100, // ✅ added fixed minimum height
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 14,
    color: '#009EFF',
  },
  subHeading: {
    fontSize: 12,
    color: commonColor.black,
    ...styles.mb10,
  },
  project: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    ...styles.pv10,
    ...styles.ph20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ECF2FF',
    ...styles.pv10,
    ...styles.ph20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  verticalLine: {
    borderLeftWidth: 1,
    borderColor: '#8F8E8E',
    height: '60%',
    alignSelf: 'center',
  },
});
