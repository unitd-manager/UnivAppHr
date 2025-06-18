import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, FlatList } from 'react-native';
import { useSelector } from 'react-redux';

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { getHeight, moderateScale } from '../../../common/constants';
import EText from '../../../components/common/EText';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNav } from '../../../navigation/NavigationKeys';

import api from '../../../api/api';

const LeaveDetails = () => {
  const navigation = useNavigation();
  const [user, setUserData] = useState(null);
  const [employee, setEmployee] = useState([]);
  const [leaveInsertData, setLeaveInsertData] = useState({
    employee_id: '',
    from_date: '',
    to_date: '',
    leave_type: '',
    reason: '',
  });

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showLeaveTypeDropdown, setShowLeaveTypeDropdown] = useState(false);

  const leaveTypes = ['Leave', 'Permission'];

  const [showHoursDropdown, setShowLeavehourTypeDropdown] = useState(false);

  const leavehourTypes = ['1','2','3','4','5'];

  // Added missing date picker modal states and handlers
  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Handlers for showing date pickers
  const onPressStartDate = () => {
    setStartDatePickerVisible(true);
  };

  const onPressEndDate = () => {
    setEndDatePickerVisible(true);
  };

  // Handlers for confirming date selection
  const handleStartDateConfirm = (date) => {
    setStartDate(moment(date).format('YYYY-MM-DD'));
    setStartDatePickerVisible(false);
    handleInputs('from_date', moment(date).format('YYYY-MM-DD'));
  };

  const handleEndDateConfirm = (date) => {
    setEndDate(moment(date).format('YYYY-MM-DD'));
    setEndDatePickerVisible(false);
    handleInputs('to_date', moment(date).format('YYYY-MM-DD'));
  };

  // Handlers for hiding date pickers
  const hideStartDatePicker = () => {
    setStartDatePickerVisible(false);
  };

  const hideEndDatePicker = () => {
    setEndDatePickerVisible(false);
  };


  const getUser = async () => {
    let userData = await AsyncStorage.getItem('USER');
    userData = JSON.parse(userData);
    setUserData(userData);
  };
 
  const getEmployee = () => {
    if (!user?.email) return;
    api
      .post('/leave/getEmployeeEmail', { email: user?.email })
      .then((res) => {
        const data = res.data.data.map((el) => ({
          ...el,
          from_date: String(el.from_date).split(','),
          to_date: String(el.to_date).split(','),
        }));
        setEmployee(data);
      })
      .catch(() => Alert.alert('Error', 'Failed to fetch employee data.'));
  };

  const handleInputs = (name, value) => {
    setLeaveInsertData((prevData) => ({ ...prevData, [name]: value }));
  };

  const insertLeave = () => {
    if (
      !leaveInsertData.leave_type ||
      !leaveInsertData.from_date ||
      !leaveInsertData.to_date
    ) {
      Alert.alert('Please fill in all required fields.');
      return;
    }

    // New validation: Check if from_date is after to_date
    if (moment(leaveInsertData.from_date).isAfter(moment(leaveInsertData.to_date))) {
      Alert.alert('Validation Error', 'End date cannot be before start date.');
      return;
    }

    // First check if there's an existing leave request for these dates
    api
      .post('/leave/getLeaveEmpByid', { employee_id: leaveInsertData.employee_id })
      .then((res) => {
        const existingLeaves = res.data.data || [];
        const hasOverlappingLeave = existingLeaves.some(leave => {
          // Handle if from_date and to_date are arrays or strings
          const existingFromDates = Array.isArray(leave.from_date) ? leave.from_date : [leave.from_date];
          const existingToDates = Array.isArray(leave.to_date) ? leave.to_date : [leave.to_date];

          // Check overlap for any date range in existing leave
          return existingFromDates.some((fromDate, index) => {
            const toDate = existingToDates[index] || fromDate;

            const existingStartDate = moment(fromDate, 'YYYY-MM-DD');
            const existingEndDate = moment(toDate, 'YYYY-MM-DD');
            const newStartDate = moment(leaveInsertData.from_date, 'YYYY-MM-DD');
            const newEndDate = moment(leaveInsertData.to_date, 'YYYY-MM-DD');

            // Check if new leave overlaps with existing leave range (inclusive)
            return (
              newStartDate.isBetween(existingStartDate, existingEndDate, null, '[]') ||
              newEndDate.isBetween(existingStartDate, existingEndDate, null, '[]') ||
              existingStartDate.isBetween(newStartDate, newEndDate, null, '[]') ||
              existingEndDate.isBetween(newStartDate, newEndDate, null, '[]') ||
              newStartDate.isSame(existingStartDate) ||
              newEndDate.isSame(existingEndDate)
            );
          });
        });

        if (hasOverlappingLeave) {
          Alert.alert('Leave Request Overlap', 'You already have a leave request for these dates.');
          return;
        }

        // If no overlapping leaves, proceed with submitting the new request
        const formData = {
          no_of_days: leaveInsertData.leave_type === 'Permission' ? '0' : moment(leaveInsertData.to_date).diff(moment(leaveInsertData.from_date), 'days') + 1,
          leave_type: leaveInsertData.leave_type,
          from_date: leaveInsertData.from_date,
          hours: leaveInsertData.hours || '',
          to_date: leaveInsertData.to_date,
          isFullDay: leaveInsertData.leave_type !== 'Permission',
          isHalfDay: false,
          reason: leaveInsertData.reason,
          employee_id: leaveInsertData.employee_id,
          site_id: leaveInsertData.site_id || '',
          branch_id: leaveInsertData.branch_id || '',
          creation_date: moment().format('DD-MMM-YYYY')
        };

        api
          .post('/leave/insertLeave', formData)
          .then(() => {
            Alert.alert('Leave Request sent successfully.');
            resetForm();
            navigation.navigate(StackNav.ViewLeaves);
          })
          .catch(error => {
            console.log('Error:', error);
            Alert.alert('Error', 'Failed to submit leave request. Please try again.');
          });
      })
      .catch(error => {
        console.log('Error checking existing leaves:', error);
        Alert.alert('Error', 'Failed to validate leave request. Please try again.');
      });
  };
  
  // Function to reset the form
  const resetForm = () => {
    setLeaveInsertData({
      employee_id: user?.employee_id || '',
      from_date: '',
      to_date: '',
      leave_type: '',
      reason: '',
    });
    setShowFromDatePicker(false);
    setShowToDatePicker(false);
    setShowLeaveTypeDropdown(false);
    setShowLeavehourTypeDropdown(false);
  };
  
  

  const handleFromDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowFromDatePicker(false);
    handleInputs('from_date', moment(currentDate).format('YYYY-MM-DD'));
  };

  const handleToDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowToDatePicker(false);
    handleInputs('to_date', moment(currentDate).format('YYYY-MM-DD'));
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user?.employee_id) {
      setLeaveInsertData((prevData) => ({
        ...prevData,
        employee_id: user.employee_id,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (user) getEmployee();
  }, [user]);
  const colors = useSelector(state => state.theme.theme);
  const BlurredStyle = {
    backgroundColor: colors.inputBg,
    borderColor: colors.backgroundColor,
  };
  const FocusedStyle = {
    backgroundColor: colors.inputBg,
    borderColor: colors.backgroundColor,
    color: colors.textColor
  };
  const [totalDaysInputStyle, SetTotalDaysInputStyle] = useState(BlurredStyle);

   const onFocusInput = onHighlight => onHighlight(FocusedStyle);
  const onBlurInput = onHighlight => onHighlight(FocusedStyle);
 
  const onFocustotalDays = () => onFocusInput(SetTotalDaysInputStyle);
  const onBlurtotalDays = () => onBlurInput(SetTotalDaysInputStyle);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Leave Details</Text>

     <DateTimePickerModal
            isVisible={startDatePickerVisible}
            mode="date"
            onConfirm={handleStartDateConfirm}
            onCancel={hideStartDatePicker}
            date={new Date()}
            minimumDate={new Date()}
          />

          <DateTimePickerModal
            isVisible={endDatePickerVisible}
            mode="date"
            onConfirm={handleEndDateConfirm}
            onCancel={hideEndDatePicker}
            date={new Date()}
            minimumDate={new Date()}
          />

          


          <View style={styles.rowContainer}>
            <TouchableOpacity
              onPress={onPressStartDate}
              style={[
                styles.datePickerStyle,
                totalDaysInputStyle
              ]}
              _onFocus={onFocustotalDays}
              onBlur={onBlurtotalDays}
            >
              <EText
                type={'r16'}
                color={startDate ? colors.textColor : colors.grayScale5}>
                {startDate ? startDate : 'Start Date'}
              </EText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onPressEndDate}
              style={[
                styles.datePickerStyle,
                totalDaysInputStyle
              ]}>
              <EText
                type={'r16'}
                color={endDate ? colors.textColor : colors.grayScale5}>
                {endDate ? endDate : 'End Date'}
              </EText>
            </TouchableOpacity>
          </View>

      <Text style={styles.label}>Type of Leave *</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowLeaveTypeDropdown((prev) => !prev)}
      >
        <Text style={styles.input1}>{leaveInsertData.leave_type || 'Select Leave Type'}</Text>
      </TouchableOpacity>

      {showLeaveTypeDropdown && (
        <View style={styles.dropdown}>
          <FlatList
            data={leaveTypes}
            nestedScrollEnabled={true} // Enable nested scrolling
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  handleInputs('leave_type', item);
                  setShowLeaveTypeDropdown(false);
                }}
              >
                <Text style={styles.input1}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

{leaveInsertData.leave_type === 'Permission' && (
  <>
    <Text style={styles.label}>Select Hours *</Text>
    <TouchableOpacity
      style={styles.input}
      onPress={() => setShowLeavehourTypeDropdown((prev) => !prev)}
    >
      <Text style={styles.input1}>{leaveInsertData.hours || 'Select Hours'}</Text>
    </TouchableOpacity>

    {showHoursDropdown && (
      <View style={styles.dropdown}>
        <FlatList
          data={leavehourTypes}
          nestedScrollEnabled={true} // Enable nested scrolling
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                handleInputs('hours', item);
                setShowLeavehourTypeDropdown(false);
              }}
            >
              <Text style={styles.input1}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    )}
  </>
)}


      <Text style={styles.label}>Reason *</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={4}
        placeholder="Enter reason for leave"
        placeholderTextColor="black" 
        onChangeText={(text) => handleInputs('reason', text)}
        value={leaveInsertData.reason}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={insertLeave}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.navigate(StackNav.ViewLeaves)}>
          <Text style={styles.buttonText}>View Leave History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    alignSelf: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
    marginBottom: 16,
    elevation: 2,
  },
  input1: {
    fontSize: 14,
    color: '#000',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    backgroundColor: '#fff',
    height: 100,
    textAlignVertical: 'top',
    color: '#000',
    elevation: 2,
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 3,
    maxHeight: 180,
    marginBottom: 16,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 16,
    gap: 8,
  },
  datePickerStyle: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    elevation: 2,
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0d6efd',
    alignItems: 'center',
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LeaveDetails;
