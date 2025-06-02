import React, { useState, useEffect } from 'react';
import { 
  Typography, Paper, Box, Button, Grid, ToggleButton, 
  ToggleButtonGroup, Switch, FormControlLabel, Divider,
  Card, CardContent, Chip, Fade, useTheme
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import SaveIcon from '@mui/icons-material/Save';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const Availability = () => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [availabilityData, setAvailabilityData] = useState({});

  // Generate time slots from 9 AM to 5 PM in 30-minute intervals
  const timeSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    timeSlots.push(`${hour}:00`);
    timeSlots.push(`${hour}:30`);
  }

  // Initialize week days and availability data when selected date changes
  useEffect(() => {
    const startDay = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start from Monday
    const days = [];
    const newAvailabilityData = { ...availabilityData };

    for (let i = 0; i < 7; i++) {
      const day = addDays(startDay, i);
      days.push(day);

      // Initialize availability data for this day if not exists
      const dayKey = format(day, 'yyyy-MM-dd');
      if (!newAvailabilityData[dayKey]) {
        newAvailabilityData[dayKey] = {
          isOffDay: false,
          slots: timeSlots.reduce((acc, slot) => {
            // Randomly pre-fill some slots as available for demo purposes
            acc[slot] = Math.random() > 0.3;
            return acc;
          }, {})
        };
      }
    }

    setWeekDays(days);
    setAvailabilityData(newAvailabilityData);
  }, [selectedDate]);

  // Handle date selection from calendar
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Toggle off day status
  const handleOffDayToggle = (dayKey) => {
    setAvailabilityData(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isOffDay: !prev[dayKey].isOffDay
      }
    }));
  };

  // Toggle slot availability
  const handleSlotToggle = (dayKey, slot) => {
    setAvailabilityData(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        slots: {
          ...prev[dayKey].slots,
          [slot]: !prev[dayKey].slots[slot]
        }
      }
    }));
  };

  // Count available slots for a day
  const countAvailableSlots = (dayKey) => {
    if (!availabilityData[dayKey]) return 0;
    return Object.values(availabilityData[dayKey].slots).filter(Boolean).length;
  };

  // Save changes (placeholder function)
  const handleSaveChanges = () => {
    console.log('Saving availability data:', availabilityData);
    // Here you would typically send this data to your backend
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      {/* Top Control Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Availability Schedule</Typography>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={handleSaveChanges}
          sx={{ borderRadius: 2 }}
        >
          Save Changes
        </Button>
      </Box>
      
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Week of {format(weekDays[0] || selectedDate, 'MMMM d, yyyy')}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Calendar Day Picker */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Select Date</Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateCalendar 
                  value={selectedDate} 
                  onChange={handleDateChange}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Weekly Slots View */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 2, overflow: 'auto', maxHeight: '70vh' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Weekly Schedule</Typography>
              
              <Box sx={{ display: 'flex', overflowX: 'auto', pb: 2 }}>
                {weekDays.map((day, index) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dayData = availabilityData[dayKey] || { isOffDay: false, slots: {} };
                  const availableSlotsCount = countAvailableSlots(dayKey);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <Card 
                      key={dayKey} 
                      elevation={1}
                      sx={{
                        minWidth: 200,
                        mr: 2,
                        borderRadius: 2,
                        border: isToday ? `2px solid ${theme.palette.primary.main}` : 'none',
                        opacity: dayData.isOffDay ? 0.7 : 1,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {format(day, 'EEEE')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {format(day, 'MMM d')}
                          </Typography>
                        </Box>
                        
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={!dayData.isOffDay}
                              onChange={() => handleOffDayToggle(dayKey)}
                              color="primary"
                            />
                          }
                          label={dayData.isOffDay ? "Off Day" : "Working Day"}
                        />
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            icon={<AccessTimeIcon />}
                            label={`${availableSlotsCount}/${timeSlots.length} slots`}
                            color={availableSlotsCount > 0 ? "primary" : "default"}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          
                          {!dayData.isOffDay && availableSlotsCount > 0 && (
                            <Fade in={true}>
                              <Chip 
                                icon={<EventAvailableIcon />}
                                label={`${availableSlotsCount/2} hours available`}
                                color="success"
                                size="small"
                                variant="outlined"
                              />
                            </Fade>
                          )}
                        </Box>
                        
                        {!dayData.isOffDay && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Time Slots:
                            </Typography>
                            <Grid container spacing={1}>
                              {timeSlots.map((slot) => (
                                <Grid item xs={6} key={slot}>
                                  <ToggleButton
                                    value={slot}
                                    selected={dayData.slots[slot]}
                                    onChange={() => handleSlotToggle(dayKey, slot)}
                                    size="small"
                                    color="primary"
                                    fullWidth
                                    sx={{
                                      py: 0.5,
                                      transition: 'all 0.2s ease',
                                      '&.Mui-selected': {
                                        backgroundColor: theme.palette.primary.light,
                                        color: theme.palette.primary.contrastText,
                                      }
                                    }}
                                  >
                                    {slot}
                                  </ToggleButton>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}
                        
                        {dayData.isOffDay && (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            height: 150,
                            opacity: 0.7
                          }}>
                            <EventBusyIcon color="error" sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Not Available (Off Day)
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Availability;