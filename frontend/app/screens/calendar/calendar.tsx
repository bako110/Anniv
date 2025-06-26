import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Swiper from 'react-native-swiper';

LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre'
  ],
  monthNamesShort: [
    'Janv.',
    'Févr.',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juil.',
    'Août',
    'Sept.',
    'Oct.',
    'Nov.',
    'Déc.'
  ],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Événements de démonstration
  const events = {
    '2023-06-25': [
      { id: '1', title: 'Anniversaire Pierre', time: 'Toute la journée', type: 'birthday' },
      { id: '2', title: 'Soirée barbecue', time: '19h00', type: 'event' }
    ],
    '2023-06-28': [
      { id: '3', title: 'Fête Julie', time: '20h00', type: 'event' }
    ],
    '2023-07-02': [
      { id: '4', title: 'Anniversaire Sophie', time: 'Toute la journée', type: 'birthday' }
    ],
    '2023-07-15': [
      { id: '5', title: 'Week-end plage', time: 'Toute la journée', type: 'event' }
    ]
  };

  const markedDates = {};
  Object.keys(events).forEach(date => {
    markedDates[date] = { 
      marked: true,
      dotColor: events[date][0].type === 'birthday' ? '#f56565' : '#667eea',
      selected: date === selectedDate,
      selectedColor: '#667eea'
    };
  });
  markedDates[selectedDate] = { 
    selected: true, 
    selectedColor: '#667eea',
    selectedTextColor: 'white'
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleMonthChange = (month) => {
    setCurrentMonth(month.month);
    setCurrentYear(month.year);
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.eventItem,
        item.type === 'birthday' ? styles.birthdayEvent : styles.normalEvent
      ]}
      onPress={() => router.push(`/screens/events/EventDetailsScreen?eventId=${item.id}`)}
    >
      <View style={styles.eventIcon}>
        {item.type === 'birthday' ? (
          <Ionicons name="gift" size={20} color="#f56565" />
        ) : (
          <Ionicons name="calendar" size={20} color="#667eea" />
        )}
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventTime}>{item.time}</Text>
      </View>
      <AntDesign name="right" size={18} color="#94a3b8" />
    </TouchableOpacity>
  );

  const renderUpcomingEvents = () => {
    const upcomingDates = Object.keys(events)
      .filter(date => date >= selectedDate && date !== selectedDate)
      .sort()
      .slice(0, 3);

    return (
      <View style={styles.upcomingContainer}>
        <Text style={styles.sectionTitle}>Événements à venir</Text>
        {upcomingDates.length > 0 ? (
          upcomingDates.map(date => (
            <TouchableOpacity 
              key={date} 
              style={styles.upcomingDateCard}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={styles.upcomingDate}>
                {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </Text>
              <View style={styles.upcomingEvents}>
                {events[date].map(event => (
                  <View key={event.id} style={styles.upcomingEvent}>
                    <View style={[
                      styles.upcomingEventDot,
                      { backgroundColor: event.type === 'birthday' ? '#f56565' : '#667eea' }
                    ]} />
                    <Text style={styles.upcomingEventTitle}>{event.title}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noEventsText}>Aucun événement à venir</Text>
        )}
      </View>
    );
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{Object.keys(events).length}</Text>
        <Text style={styles.statLabel}>Événements</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {Object.values(events).filter(e => e[0].type === 'birthday').length}
        </Text>
        <Text style={styles.statLabel}>Anniversaires</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {Object.values(events).filter(e => e[0].type === 'event').length}
        </Text>
        <Text style={styles.statLabel}>Sorties</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#667eea" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendrier</Text>
        <TouchableOpacity onPress={() => router.push('/screens/events/createevent')}>
          <Ionicons name="add" size={24} color="#667eea" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView style={styles.content}>
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            onMonthChange={handleMonthChange}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#64748b',
              selectedDayBackgroundColor: '#667eea',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#667eea',
              dayTextColor: '#334155',
              textDisabledColor: '#cbd5e1',
              dotColor: '#667eea',
              selectedDotColor: '#ffffff',
              arrowColor: '#667eea',
              monthTextColor: '#1e293b',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12
            }}
            firstDay={1}
            hideExtraDays
            enableSwipeMonths
          />
        </View>

        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {new Date(selectedDate).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long',
              year: 'numeric' 
            })}
          </Text>
          {events[selectedDate] ? (
            <FlatList
              data={events[selectedDate]}
              renderItem={renderEventItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noEvents}>
              <Ionicons name="calendar-outline" size={40} color="#cbd5e1" />
              <Text style={styles.noEventsText}>Aucun événement ce jour</Text>
              <TouchableOpacity 
                style={styles.addEventButton}
                onPress={() => router.push('/screens/events/createevent')}
              >
                <Text style={styles.addEventButtonText}>Ajouter un événement</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {renderStats()}
        {renderUpcomingEvents()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  selectedDateContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  birthdayEvent: {
    backgroundColor: '#fff5f5',
  },
  normalEvent: {
    backgroundColor: 'white',
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#64748b',
  },
  noEvents: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noEventsText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 10,
    marginBottom: 20,
  },
  addEventButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addEventButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  upcomingContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  upcomingDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  upcomingDate: {
    width: 100,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  upcomingEvents: {
    flex: 1,
  },
  upcomingEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  upcomingEventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  upcomingEventTitle: {
    fontSize: 14,
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
});

export default CalendarScreen;