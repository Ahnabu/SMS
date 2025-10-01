import React, { useState, useEffect, useCallback } from "react";
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
  X,
  BookOpen,
  AlertCircle,
  Filter,
  Search,
  CalendarDays,
  Star,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
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

  // Filter events based on search and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || event.type === filterType;
    const matchesPriority = filterPriority === "all" || event.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      {/* Enhanced Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <CalendarDays className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Academic Calendar
                </h1>
                <p className="text-gray-600 text-lg">
                  Organize and manage all school events seamlessly
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold text-green-700">{events.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">High Priority</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {events.filter(e => e.priority === 'high').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold text-blue-700">
                  {events.filter(e => new Date(e.startDate).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Upcoming</p>
                <p className="text-3xl font-bold text-purple-700">
                  {events.filter(e => new Date(e.startDate) > new Date()).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mt-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/90"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 min-w-[120px]"
                >
                  <option value="all">All Types</option>
                  <option value="event">Events</option>
                  <option value="exam">Exams</option>
                  <option value="holiday">Holidays</option>
                  <option value="meeting">Meetings</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                </select>
              </div>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 min-w-[120px]"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Event Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden">
            {/* Floating Close Button */}
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditingEvent(null);
                resetForm();
              }}
              className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full p-3 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Enhanced Modal Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              {/* Modal Header with Gradient */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    {editingEvent ? (
                      <Edit className="w-8 h-8" />
                    ) : (
                      <Plus className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">
                      {editingEvent ? "Edit Event" : "Create New Event"}
                    </h2>
                    <p className="text-blue-100 mt-1">
                      {editingEvent ? "Update event details" : "Add a new event to the academic calendar"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Enhanced Form Content */}
              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="title"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          Event Title *
                        </label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          placeholder="Enter event title..."
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label
                          htmlFor="eventType"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          Event Type *
                        </label>
                        <select
                          id="eventType"
                          value={formData.eventType}
                          onChange={(e) =>
                            setFormData({ ...formData, eventType: e.target.value })
                          }
                          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                          required
                        >
                          <option value="event">📅 General Event</option>
                          <option value="holiday">🏖️ Holiday</option>
                          <option value="exam">📝 Exam</option>
                          <option value="meeting">🤝 Meeting</option>
                          <option value="sports">⚽ Sports</option>
                          <option value="cultural">🎭 Cultural</option>
                          <option value="parent-teacher">👨‍👩‍👧‍👦 Parent-Teacher</option>
                          <option value="other">📋 Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-span-1 lg:col-span-2 space-y-2">
                      <label
                        htmlFor="description"
                        className="block text-sm font-semibold text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                        placeholder="Provide additional details about the event..."
                      />
                    </div>
                  </div>

                  {/* Date & Time Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Date & Time</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="startDate"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          Start Date *
                        </label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({ ...formData, startDate: e.target.value })
                          }
                          className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label
                          htmlFor="endDate"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          End Date *
                        </label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData({ ...formData, endDate: e.target.value })
                          }
                          className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="col-span-1 lg:col-span-2">
                      <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <input
                          type="checkbox"
                          id="isAllDay"
                          checked={formData.isAllDay}
                          onChange={(e) =>
                            setFormData({ ...formData, isAllDay: e.target.checked })
                          }
                          className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-200"
                        />
                        <label htmlFor="isAllDay" className="text-sm font-semibold text-blue-700">
                          🌅 All Day Event
                        </label>
                      </div>
                    </div>
                  </div>

                  {!formData.isAllDay && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label
                            htmlFor="startTime"
                            className="block text-sm font-semibold text-gray-700"
                          >
                            ⏰ Start Time
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
                            className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label
                            htmlFor="endTime"
                            className="block text-sm font-semibold text-gray-700"
                          >
                            ⏰ End Time
                          </label>
                          <Input
                            id="endTime"
                            type="time"
                            value={formData.endTime}
                            onChange={(e) =>
                              setFormData({ ...formData, endTime: e.target.value })
                            }
                            className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location & Settings Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Location & Settings</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="location"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          📍 Location
                        </label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) =>
                            setFormData({ ...formData, location: e.target.value })
                          }
                          className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          placeholder="Enter event location..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label
                          htmlFor="priority"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          ⭐ Priority Level
                        </label>
                        <select
                          id="priority"
                          value={formData.priority}
                          onChange={(e) =>
                            setFormData({ ...formData, priority: e.target.value })
                          }
                          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                        >
                          <option value="low">🟢 Low Priority</option>
                          <option value="medium">🟡 Medium Priority</option>
                          <option value="high">🔴 High Priority</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="targetAudience"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          👥 Target Audience
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
                          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                        >
                          <option value="all">🏫 All School</option>
                          <option value="specific">👥 Specific Groups</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label
                          htmlFor="status"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          📊 Status
                        </label>
                        <select
                          id="status"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                          className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                          required
                        >
                          <option value="draft">📝 Draft</option>
                          <option value="published">✅ Published</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="color"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          🎨 Event Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            id="color"
                            type="color"
                            value={formData.color}
                            onChange={(e) =>
                              setFormData({ ...formData, color: e.target.value })
                            }
                            className="w-16 h-12 border-2 border-gray-200 rounded-xl cursor-pointer"
                            title="Choose event color"
                          />
                          <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                            This color will be used in calendar displays
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                          <input
                            id="isRecurring"
                            type="checkbox"
                            checked={formData.isRecurring}
                            onChange={(e) =>
                              setFormData({ ...formData, isRecurring: e.target.checked })
                            }
                            className="h-5 w-5 text-green-600 rounded focus:ring-2 focus:ring-green-200"
                          />
                          <label
                            htmlFor="isRecurring"
                            className="text-sm font-semibold text-green-700"
                          >
                            🔄 Recurring Event
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </div>
                      ) : editingEvent ? (
                        <div className="flex items-center gap-2">
                          <Edit className="w-5 h-5" />
                          Update Event
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Plus className="w-5 h-5" />
                          Create Event
                        </div>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingEvent(null);
                        resetForm();
                      }}
                      className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Events List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <CalendarDays className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">All Events</h2>
                <p className="text-indigo-100 mt-1">
                  {filteredEvents.length} of {events.length} events {searchTerm || filterType !== "all" || filterPriority !== "all" ? "matching filters" : "total"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Loading events...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredEvents.map((event, index) => (
                <div
                  key={event._id}
                  className="group relative bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Event Color Accent */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-2 rounded-r-lg"
                    style={{ backgroundColor: event.color }}
                  />
                  
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle, ${event.color} 1px, transparent 1px)`,
                      backgroundSize: '10px 10px'
                    }} />
                  </div>
                  
                  <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      {/* Event Header */}
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`${getEventTypeColor(event.type)} font-semibold shadow-sm`}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </span>
                          <span className={`${getPriorityColor(event.priority)} font-semibold shadow-sm`}>
                            {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Event Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">Duration</p>
                            <p className="text-xs">
                              {formatDate(event.startDate)} - {formatDate(event.endDate)}
                            </p>
                          </div>
                        </div>
                        
                        {!event.isAllDay && event.startTime && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Clock className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="text-sm">
                              <p className="font-medium">Time</p>
                              <p className="text-xs">
                                {formatTime(event.startTime)} - {formatTime(event.endTime || "")}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {event.venue && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <MapPin className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="text-sm">
                              <p className="font-medium">Location</p>
                              <p className="text-xs">{event.venue}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Users className="w-4 h-4 text-orange-600" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">Audience</p>
                            <p className="text-xs">
                              {event.targetAudience === "all" ? "All Students" : "Specific Groups"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Event Description */}
                      {event.description && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {event.description}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => openEditForm(event)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      
                      <Button
                        onClick={() => handleDelete(event._id)}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </div>
              ))}
              
              {/* Empty State */}
              {filteredEvents.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CalendarDays className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {searchTerm || filterType !== "all" || filterPriority !== "all" 
                      ? "No events match your filters" 
                      : "No events found"}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchTerm || filterType !== "all" || filterPriority !== "all"
                      ? "Try adjusting your search criteria or filters to find events."
                      : "Get started by creating your first academic event for the school calendar."}
                  </p>
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Event
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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
