import { StyleSheet } from "react-native";


const Eventliststyles = StyleSheet.create({
 
   container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoryScroll: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  categoryItemActive: {
    backgroundColor: '#f1f5f9',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryTextActive: {
    color: '#1e293b',
    fontWeight: '600',
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 10,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  organizerDetails: {
    flex: 1,
  },
  organizerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 4,
  },
  postedTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  eventContent: {
    paddingHorizontal: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  eventInfoContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  eventInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flex: 1,
  },
  eventInfoText: {
    fontSize: 13,
    color: '#475569',
    marginLeft: 6,
    flex: 1,
  },
  eventPriceContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  participantsContainer: {
    marginBottom: 15,
  },
  participantAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  moreParticipants: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  moreParticipantsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  engagementStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  likeIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 16,
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  mainActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
    fontWeight: '500',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  eventActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    flex: 0.45,
    justifyContent: 'center',
  },
  eventActionButtonActive: {
    backgroundColor: '#fef3c7',
  },
  eventActionButtonGoing: {
    backgroundColor: '#667eea',
  },
  eventActionText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '600',
  },
  eventActionTextActive: {
    color: '#f59e0b',
  },
  eventActionTextGoing: {
    color: 'white',
  },
});


export default Eventliststyles