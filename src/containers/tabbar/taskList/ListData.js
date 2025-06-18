import {StyleSheet, View, Text} from 'react-native';
import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Feather';

import {commonColor, styles} from '../../../themes';
import {moderateScale} from '../../../common/constants';

const ListData = ({item, user}) => {
  const colors = useSelector(state => state.theme.theme);

  if (!user || user.staff_id !== item.staff_id) return <View style={{height: 0}} />;

  const calculateTotalTime = (startTime, endTime) => {
    if (!startTime || !endTime) return '00:00:00';
    const startMoment = moment(startTime, 'h:mm:ss a');
    const endMoment = moment(endTime, 'h:mm:ss a');
    if (!startMoment.isValid() || !endMoment.isValid()) return '00:00:00';

    const duration = moment.duration(endMoment.diff(startMoment));
    return `${Math.floor(duration.asHours()).toString().padStart(2, '0')}:${Math.floor(duration.asMinutes()) % 60
      .toString()
      .padStart(2, '0')}:${Math.floor(duration.asSeconds()) % 60
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <View style={[localStyles.innerContainer, {backgroundColor: colors.dark ? colors.dark2 : colors.grayScale1}]}>
      <View style={[localStyles.project, {flexDirection: 'row', justifyContent: 'space-between'}]}>
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
            {!item?.day_check_in_time ? item?.night_check_In_time : item?.day_check_in_time}
          </Text>
        </View>

        <View style={localStyles.verticalLine} />

        <View>
          <Text style={localStyles.subHeading}>
            {!item?.day_check_in_time ? 'Night Check Out' : 'Day Check Out'}
          </Text>
          <Text style={[localStyles.subHeading, {color: '#009EFF'}]}>
            {!item?.day_check_in_time ? item?.night_check_out_time : item?.day_check_out_time}
          </Text>
        </View>

        <View style={localStyles.verticalLine} />

        <View>
          <Text style={localStyles.subHeading}>Working Hrs</Text>
          <Text style={[localStyles.subHeading, {color: '#009EFF'}]}>
            {calculateTotalTime(
              !item?.day_check_in_time ? item?.night_check_In_time : item?.day_check_in_time,
              !item?.day_check_in_time ? item?.night_check_out_time : item?.day_check_out_time
            )}
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    ...styles.pv10,
    ...styles.ph20,
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
