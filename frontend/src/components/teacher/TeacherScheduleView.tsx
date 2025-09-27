import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Clock,
  Calendar,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
} from "lucide-react";
import { toast } from "sonner";
import { teacherApi } from "../../services/teacher.api";

interface Period {
  id: string;
  startTime: string;
  endTime: string;
  subject: string;
  grade: string;
  section: string;
  room: string;
  studentsCount: number;
  isActive: boolean;
  isCompleted: boolean;
  attendanceMarked: boolean;
}

interface DaySchedule {
  day: string;
  date: string;
  periods: Period[];
}

interface WeeklySchedule {
  weekStartDate: string;
  weekEndDate: string;
  days: DaySchedule[];
}

const TeacherScheduleView: React.FC = () => {
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const loadTeacherSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teacherApi.getTeacherSchedule({
        date: selectedDate.toISOString().split('T')[0],
      });
      
      if (response.data.success) {
        setSchedule(response.data.data.schedule);
      }
    } catch (error: any) {
      console.error("Failed to load teacher schedule:", error);
      toast.error(error.response?.data?.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadTeacherSchedule();
  }, [selectedDate, loadTeacherSchedule]);

  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isCurrentPeriod = (period: Period, currentDate: Date) => {
    if (!schedule) return false;
    
    const today = new Date();
    const scheduleDate = new Date(currentDate);
    
    // Check if it's today
    if (scheduleDate.toDateString() !== today.toDateString()) {
      return false;
    }

    const startTime = new Date(`${today.toDateString()} ${period.startTime}`);
    const endTime = new Date(`${today.toDateString()} ${period.endTime}`);
    
    return today >= startTime && today <= endTime;
  };

  const isPeriodCompleted = (period: Period, currentDate: Date) => {
    if (!schedule) return false;
    
    const today = new Date();
    const scheduleDate = new Date(currentDate);
    
    // If it's a future date, not completed
    if (scheduleDate > today) {
      return false;
    }
    
    // If it's a past date, completed
    if (scheduleDate < today) {
      return true;
    }
    
    // If it's today, check time
    const endTime = new Date(`${today.toDateString()} ${period.endTime}`);
    return today > endTime;
  };

  const getPeriodStatus = (period: Period, currentDate: Date) => {
    if (isCurrentPeriod(period, currentDate)) {
      return {
        status: 'current',
        color: 'border-green-500 bg-green-50',
        icon: <Play className="h-4 w-4 text-green-600" />,
        text: 'Ongoing',
      };
    }
    
    if (isPeriodCompleted(period, currentDate)) {
      return {
        status: 'completed',
        color: 'border-gray-300 bg-gray-50',
        icon: <CheckCircle className="h-4 w-4 text-gray-500" />,
        text: 'Completed',
      };
    }
    
    return {
      status: 'upcoming',
      color: 'border-blue-200 bg-blue-50',
      icon: <Clock className="h-4 w-4 text-blue-600" />,
      text: 'Upcoming',
    };
  };

  const getTodaysSchedule = () => {
    if (!schedule) return null;
    
    const today = new Date().toDateString();
    return schedule.days.find(day => new Date(day.date).toDateString() === today);
  };

  const getUpcomingPeriod = () => {
    const todaySchedule = getTodaysSchedule();
    if (!todaySchedule) return null;
    
    const now = new Date();
    return todaySchedule.periods.find(period => {
      const startTime = new Date(`${now.toDateString()} ${period.startTime}`);
      return startTime > now;
    });
  };

  const getCurrentPeriod = () => {
    const todaySchedule = getTodaysSchedule();
    if (!todaySchedule) return null;
    
    return todaySchedule.periods.find(period => isCurrentPeriod(period, new Date()));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your schedule...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPeriod = getCurrentPeriod();
  const upcomingPeriod = getUpcomingPeriod();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Schedule</h2>
          <p className="text-gray-600">View your teaching schedule and periods</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={goToPreviousWeek} variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={goToToday} variant="outline" size="sm">
            Today
          </Button>
          <Button onClick={goToNextWeek} variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid gap-4 md:grid-cols-2">
        {currentPeriod ? (
          <Card className="border-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-green-700">
                <Play className="h-5 w-5 mr-2" />
                Current Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">{currentPeriod.subject}</span>
                  <span className="text-sm text-gray-600">
                    {formatTime(currentPeriod.startTime)} - {formatTime(currentPeriod.endTime)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Grade {currentPeriod.grade} - {currentPeriod.section}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Room {currentPeriod.room}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-600">
                    {currentPeriod.studentsCount} students
                  </span>
                  {!currentPeriod.attendanceMarked && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                      Attendance Pending
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Pause className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No ongoing period</p>
              </div>
            </CardContent>
          </Card>
        )}

        {upcomingPeriod ? (
          <Card className="border-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-blue-700">
                <Clock className="h-5 w-5 mr-2" />
                Next Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">{upcomingPeriod.subject}</span>
                  <span className="text-sm text-gray-600">
                    {formatTime(upcomingPeriod.startTime)} - {formatTime(upcomingPeriod.endTime)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Grade {upcomingPeriod.grade} - {upcomingPeriod.section}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Room {upcomingPeriod.room}
                  </div>
                </div>
                <div className="text-sm text-gray-600 pt-2">
                  {upcomingPeriod.studentsCount} students
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No more periods today</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Weekly Schedule */}
      {schedule && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Weekly Schedule
              </CardTitle>
              <p className="text-sm text-gray-600">
                {new Date(schedule.weekStartDate).toLocaleDateString()} - {new Date(schedule.weekEndDate).toLocaleDateString()}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {schedule.days.map((daySchedule) => (
                <div key={daySchedule.day} className="space-y-3">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-900 mr-3">
                      {daySchedule.day}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {new Date(daySchedule.date).toLocaleDateString()}
                    </span>
                    {new Date(daySchedule.date).toDateString() === new Date().toDateString() && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        Today
                      </span>
                    )}
                  </div>

                  {daySchedule.periods.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {daySchedule.periods.map((period) => {
                        const periodStatus = getPeriodStatus(period, new Date(daySchedule.date));
                        
                        return (
                          <div
                            key={period.id}
                            className={`p-4 border rounded-lg ${periodStatus.color}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">{period.subject}</h4>
                                <p className="text-sm text-gray-600">
                                  Grade {period.grade} - {period.section}
                                </p>
                              </div>
                              <div className="flex items-center text-xs">
                                {periodStatus.icon}
                                <span className="ml-1">{periodStatus.text}</span>
                              </div>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(period.startTime)} - {formatTime(period.endTime)}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                Room {period.room}
                              </div>
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {period.studentsCount} students
                              </div>
                            </div>

                            {periodStatus.status === 'completed' && !period.attendanceMarked && (
                              <div className="mt-2 flex items-center text-xs text-orange-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Attendance not marked
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No periods scheduled for this day</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!schedule && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Available</h3>
              <p className="text-gray-600">
                Your teaching schedule will appear here once it's been set up.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherScheduleView;