import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../services/admin.api";
import { useAuth } from "../../context/AuthContext";

interface AcademicEvent {
  _id: string;
  title: string;
  description?: string;
  type: "exam" | "holiday" | "event" | "meeting" | "activity";
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  startTime?: string;
  endTime?: string;
  venue?: string;
  targetAudience: "all" | "specific";
  priority: "low" | "medium" | "high";
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AcademicCalendar: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "event",
    startDate: "",
    endDate: "",
    isAllDay: true,
    startTime: "",
    endTime: "",
    location: "",
    targetAudience: {
      allSchool: true,
      grades: [] as string[],
      classes: [] as string[],
      teachers: [] as string[],
      students: [] as string[],
      parents: [] as string[],
    },
    priority: "medium",
    status: "published",
    isRecurring: false,
    color: "#3b82f6",
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getCalendarEvents();
      setEvents(response.data.data || []);
    } catch (error) {
      toast.error("Error fetching events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required user data
      if (!user?.id) {
        toast.error("User ID is required. Please log in again.");
        return;
      }
      
      if (!user?.schoolId) {
        toast.error("School ID is required. Please contact your administrator.");
        return;
      }

      // Prepare the data according to backend validation schema
      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        eventType: formData.eventType as
          | "holiday"
          | "exam" 
          | "meeting"
          | "event"
          | "sports"
          | "cultural"
          | "parent-teacher"
          | "other",
        startDate: formData.startDate,
        endDate: formData.endDate,
        isAllDay: formData.isAllDay,
        startTime: !formData.isAllDay ? formData.startTime : undefined,
        endTime: !formData.isAllDay ? formData.endTime : undefined,
        location: formData.location || undefined,
        organizerId: user.id,
        schoolId: user.schoolId,
        targetAudience: formData.targetAudience,
        priority: formData.priority as "low" | "medium" | "high",
        status: formData.status as "draft" | "published" | "cancelled",
        isRecurring: formData.isRecurring,
        ...(formData.isRecurring && {
          recurrence: {
            frequency: "weekly" as const,
            interval: 1,
          }
        }),
        color: formData.color,
      };

      if (editingEvent) {
        await adminApi.updateCalendarEvent(editingEvent._id, eventData);
        toast.success("Event updated successfully");
      } else {
        await adminApi.createCalendarEvent(eventData);
        toast.success("Event created successfully");
      }

      setIsFormOpen(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      console.error("Error saving event:", error);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error("Error saving event");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    setLoading(true);
    try {
      await adminApi.deleteCalendarEvent(eventId);
      toast.success("Event deleted successfully");
      fetchEvents();
    } catch (error) {
      toast.error("Error deleting event");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventType: "event",
      startDate: "",
      endDate: "",
      isAllDay: true,
      startTime: "",
      endTime: "",
      location: "",
      targetAudience: {
        allSchool: true,
        grades: [],
        classes: [],
        teachers: [],
        students: [],
        parents: [],
      },
      priority: "medium",
      status: "published",
      isRecurring: false,
      color: "#3b82f6",
    });
  };

  const openEditForm = (event: AcademicEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      eventType: event.type,
      startDate: event.startDate.split("T")[0],
      endDate: event.endDate.split("T")[0],
      isAllDay: event.isAllDay,
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      location: (event as any).venue || (event as any).location || "",
      targetAudience: {
        allSchool: event.targetAudience === "all",
        grades: [],
        classes: [],
        teachers: [],
        students: [],
        parents: [],
      },
      priority: event.priority,
      status: "published", // Default status if not available
      isRecurring: false, // Default if not available
      color: event.color,
    });
    setIsFormOpen(true);
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      exam: "bg-red-100 text-red-800 px-2 py-1 rounded text-xs",
      holiday: "bg-green-100 text-green-800 px-2 py-1 rounded text-xs",
      event: "bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs",
      meeting: "bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs",
      activity: "bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs",
    };
    return (
      colors[type as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs",
      medium: "bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs",
      high: "bg-red-100 text-red-800 px-2 py-1 rounded text-xs",
    };
    return (
      colors[priority as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Academic Calendar</h1>
          <p className="text-gray-600">
            Manage school events, exams, and holidays
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Event Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingEvent ? "Edit Event" : "Create New Event"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium mb-1"
                    >
                      Event Title*
                    </label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="eventType"
                      className="block text-sm font-medium mb-1"
                    >
                      Event Type*
                    </label>
                    <select
                      id="eventType"
                      value={formData.eventType}
                      onChange={(e) =>
                        setFormData({ ...formData, eventType: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="event">Event</option>
                      <option value="holiday">Holiday</option>
                      <option value="exam">Exam</option>
                      <option value="meeting">Meeting</option>
                      <option value="sports">Sports</option>
                      <option value="cultural">Cultural</option>
                      <option value="parent-teacher">Parent-Teacher</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium mb-1"
                    >
                      Start Date*
                    </label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium mb-1"
                    >
                      End Date*
                    </label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAllDay"
                    checked={formData.isAllDay}
                    onChange={(e) =>
                      setFormData({ ...formData, isAllDay: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor="isAllDay" className="text-sm font-medium">
                    All Day Event
                  </label>
                </div>

                {!formData.isAllDay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="startTime"
                        className="block text-sm font-medium mb-1"
                      >
                        Start Time
                      </label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="endTime"
                        className="block text-sm font-medium mb-1"
                      >
                        End Time
                      </label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium mb-1"
                    >
                      Location
                    </label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="priority"
                      className="block text-sm font-medium mb-1"
                    >
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="targetAudience"
                      className="block text-sm font-medium mb-1"
                    >
                      Target Audience
                    </label>
                    <select
                      id="targetAudience"
                      value={formData.targetAudience.allSchool ? "all" : "specific"}
                      onChange={(e) => {
                        const isAllSchool = e.target.value === "all";
                        setFormData({
                          ...formData,
                          targetAudience: {
                            allSchool: isAllSchool,
                            grades: [],
                            classes: [],
                            teachers: [],
                            students: [],
                            parents: [],
                          },
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All School</option>
                      <option value="specific">Specific Groups</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium mb-1"
                    >
                      Status*
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="color"
                      className="block text-sm font-medium mb-1"
                    >
                      Event Color
                    </label>
                    <input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-full h-10 border border-gray-300 rounded-md"
                      title="Choose event color"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id="isRecurring"
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) =>
                        setFormData({ ...formData, isRecurring: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isRecurring"
                      className="text-sm font-medium text-gray-700"
                    >
                      Recurring Event
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading
                      ? "Saving..."
                      : editingEvent
                      ? "Update Event"
                      : "Create Event"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingEvent(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading events...</p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <span className={getEventTypeColor(event.type)}>
                        {event.type}
                      </span>
                      <span className={getPriorityColor(event.priority)}>
                        {event.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(event.startDate)} -{" "}
                          {formatDate(event.endDate)}
                        </span>
                      </div>
                      {!event.isAllDay && event.startTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatTime(event.startTime)} -{" "}
                            {formatTime(event.endTime || "")}
                          </span>
                        </div>
                      )}
                      {event.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.venue}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {event.targetAudience === "all"
                            ? "All Students"
                            : "Specific Groups"}
                        </span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditForm(event)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No events found. Create your first event!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
//               Calendar grid view will be implemented with a calendar library
//             </p>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-7 gap-2 mb-4">
//               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
//                 <div key={day} className="p-2 text-center font-semibold text-gray-600">
//                   {day}
//                 </div>
//               ))}
//             </div>
//             <div className="text-center py-8 text-gray-500">
//               <Calendar className="w-12 h-12 mx-auto mb-2" />
//               <p>Full calendar grid view coming soon</p>
//               <p className="text-sm">Use List View to manage events</p>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// };

export default AcademicCalendar;
