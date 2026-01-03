import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetEventMastersQuery } from '../../services/eventMasterApi';
import { Calendar, ArrowRight, Loader, ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { decryptData } from '../../common/Functions/DecryptData';

function EventList() {
  const { data: events = [], isLoading, isError } = useGetEventMastersQuery();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [expandedSuperEvents, setExpandedSuperEvents] = useState({});
  const navigate = useNavigate();

  const getUserData = () => {
    try {
      const encryptedUserData = sessionStorage.getItem('user_data');
      if (encryptedUserData) {
        return decryptData(encryptedUserData);
      }
    } catch (error) {
      console.error("Error decrypting user data:", error);
    }
    return null;
  };


  useEffect(() => {
    if (events.length > 0) {
      const initialExpandedState = {};

      events.forEach(event => {
        const hasSuperEvent = event.EventSuperId && event.EventSuperId !== 0;
        if (hasSuperEvent) {
          initialExpandedState[event.EventSuperId] = true;
        }
      });

      const hasUngrouped = events.some(event => !event.EventSuperId || event.EventSuperId === 0);
      if (hasUngrouped) {
        initialExpandedState['ungrouped'] = true;
      }

      setExpandedSuperEvents(initialExpandedState);
    }
  }, [events]);

  const groupedEvents = events.reduce((acc, event) => {
    const hasSuperEvent = event.EventSuperId && event.EventSuperId !== 0;

    if (hasSuperEvent) {
      const superEventId = event.EventSuperId;
      const superEventName = event.EventSuper_Name || `Super Event ${event.EventSuperId}`;

      if (!acc[superEventId]) {
        acc[superEventId] = {
          superEventName: superEventName,
          events: []
        };
      }
      acc[superEventId].events.push(event);
    } else {
      if (!acc.ungrouped) {
        acc.ungrouped = {
          superEventName: 'Ungrouped Events',
          events: []
        };
      }
      acc.ungrouped.events.push(event);
    }
    return acc;
  }, {});

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    sessionStorage.setItem("Event_Code", event.EventMasterId);
    sessionStorage.setItem("Event_Name", event.EventMaster_Name);
    const userData = getUserData();
    const userType = userData?.user_type || '';

    if (userType === 'A') {
      navigate('/dashboard');
    } else if (userType === 'U') {
      navigate('/userdashboard');
    } else {
      navigate('/userdashboard');
    }
  };

  const toggleSuperEvent = (superEventId) => {
    setExpandedSuperEvents(prev => ({
      ...prev,
      [superEventId]: !prev[superEventId]
    }));
  };

  const sortedSuperEvents = Object.entries(groupedEvents).sort(([idA, groupA], [idB, groupB]) => {
    if (idA === 'ungrouped') return 1;
    if (idB === 'ungrouped') return -1;
    return groupA.superEventName.localeCompare(groupB.superEventName);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-red-800">Error</h2>
            <p className="text-red-600">Failed to load events. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-10 w-10 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Select an Event</h1>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Available Events</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {events.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-lg">No events available</p>
                <p className="text-gray-400 mt-2">Please check back later or contact your administrator.</p>
              </div>
            ) : (
              sortedSuperEvents.map(([superEventId, group]) => (
                <div key={superEventId}>
                  <div
                    className="p-4 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer border-b border-gray-300"
                    onClick={() => toggleSuperEvent(superEventId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {expandedSuperEvents[superEventId] ? (
                            <>
                              <FolderOpen className="h-5 w-5 text-blue-600 mr-2" />
                              <ChevronDown className="h-5 w-5 text-gray-600 mr-2" />
                            </>
                          ) : (
                            <>
                              <Folder className="h-5 w-5 text-blue-600 mr-2" />
                              <ChevronRight className="h-5 w-5 text-gray-600 mr-2" />
                            </>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {group.superEventName}
                        </h3>
                        <span className="ml-3 text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                          {group.events.length} event{group.events.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {expandedSuperEvents[superEventId] && group.events.map((event) => (
                    <div
                      key={event.EventMasterId}
                      className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer pl-14"
                      onClick={() => handleEventSelect(event)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-md font-semibold text-gray-900">
                            {event.EventMasterId} - {event.EventMaster_Name}
                          </h4>

                          <div className="mt-2 flex flex-wrap gap-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                              <span>
                                {new Date(event.Start_Date).toLocaleDateString()}
                                {event.End_Date && ` - ${new Date(event.End_Date).toLocaleDateString()}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4 flex-shrink-0">
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Select an event to view its dashboard, manage sponsors, and track activities.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EventList;