import React, { useState, useEffect } from 'react';
import { teacherApi } from '../../services/teacher.api';
import { Clock, Users, CheckCircle, XCircle, AlertCircle, UserCheck, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

interface Period {
  scheduleId: string;
  classId: string;
  grade: number;
  section: string;
  className: string;
  periodNumber: number;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  startTime: string;
  endTime: string;
  roomNumber?: string;
  canMarkAttendance: boolean;
  timeStatus: 'upcoming' | 'current' | 'past';
}

interface Student {
  id: string;
  studentId: string;
  name: string;
  rollNumber: string;
  grade: number;
  section: string;
  currentStatus: 'present' | 'absent' | 'late' | 'excused' | null;
  hasPhoto: boolean;
}

interface TeacherAttendanceViewProps {
  className?: string;
}

const TeacherAttendanceView: React.FC<TeacherAttendanceViewProps> = ({ className = '' }) => {
  const [currentPeriods, setCurrentPeriods] = useState<Period[]>([]);
  const [upcomingPeriods, setUpcomingPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [periodInfo, setPeriodInfo] = useState<any>(null);

  useEffect(() => {
    loadCurrentPeriods();
    const interval = setInterval(loadCurrentPeriods, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadCurrentPeriods = async () => {
    try {
      setLoading(true);
      const response = await teacherApi.getCurrentPeriods();
      
      if (response.data.success) {
        setCurrentPeriods(response.data.data.currentPeriods || []);
        setUpcomingPeriods(response.data.data.upcomingPeriods || []);
      }
    } catch (error) {
      console.error('Failed to load current periods:', error);
      toast.error('Failed to load current periods');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (period: Period) => {
    try {
      setLoading(true);
      
      console.log('🔍 Loading students for period:', period);
      console.log('🔍 ClassId:', period.classId);
      console.log('🔍 Subject ID:', period.subject.id);
      console.log('🔍 Period Number:', period.periodNumber);
      
      const response = await teacherApi.getStudentsForAttendance(
        period.classId,
        period.subject.id,
        period.periodNumber
      );
      
      if (response.data.success) {
        const studentsData = response.data.data.students || [];
        setStudents(studentsData);
        setPeriodInfo(response.data.data);
        
        // Initialize attendance data with current status
        const initialAttendance: {[key: string]: string} = {};
        studentsData.forEach((student: Student) => {
          initialAttendance[student.id] = student.currentStatus || '';
        });
        setAttendanceData(initialAttendance);

        if (response.data.data.attendanceAlreadyMarked) {
          toast.info('Attendance already marked for this period');
        }
      }
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodSelect = (period: Period) => {
    if (!period.canMarkAttendance && period.timeStatus !== 'current') {
      if (period.timeStatus === 'past') {
        toast.error(`This period has ended at ${period.endTime}`);
      } else {
        toast.error(`This period starts at ${period.startTime}`);
      }
      return;
    }

    setSelectedPeriod(period);
    loadStudents(period);
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    const newAttendanceData: {[key: string]: string} = {};
    students.forEach(student => {
      newAttendanceData[student.id] = status;
    });
    setAttendanceData(newAttendanceData);
    toast.success(`Marked all students as ${status}`);
  };

  const submitAttendance = async () => {
    if (!selectedPeriod) return;

    // Validate that all students have attendance marked
    const unmarkedStudents = students.filter(student => !attendanceData[student.id]);
    if (unmarkedStudents.length > 0) {
      toast.error(`Please mark attendance for all students. ${unmarkedStudents.length} students remaining.`);
      return;
    }

    try {
      setSubmitting(true);

      const attendancePayload = {
        classId: selectedPeriod.classId,
        subjectId: selectedPeriod.subject.id,
        grade: selectedPeriod.grade,
        section: selectedPeriod.section,
        date: new Date().toISOString().split('T')[0],
        period: selectedPeriod.periodNumber,
        students: students.map(student => ({
          studentId: student.id,
          status: attendanceData[student.id] as 'present' | 'absent' | 'late' | 'excused'
        }))
      };

      const response = await teacherApi.markStudentAttendance(attendancePayload);
      
      if (response.data.success) {
        toast.success('Attendance marked successfully!');
        
        // Show attendance summary
        const summary = response.data.data;
        toast.success(
          `Present: ${summary.presentCount}, Absent: ${summary.absentCount}, Late: ${summary.lateCount}`
        );

        // Refresh periods and clear selection
        setSelectedPeriod(null);
        setStudents([]);
        setAttendanceData({});
        loadCurrentPeriods();
      }
    } catch (error: any) {
      console.error('Failed to mark attendance:', error);
      const errorMessage = error.response?.data?.message || 'Failed to mark attendance';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'excused': return <UserCheck className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-300';
      case 'absent': return 'bg-red-100 text-red-800 border-red-300';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading && !selectedPeriod) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600">Current time: {getCurrentTime()}</p>
        </div>
        {selectedPeriod && (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedPeriod(null);
              setStudents([]);
              setAttendanceData({});
            }}
          >
            Back to Periods
          </Button>
        )}
      </div>

      {!selectedPeriod ? (
        <div className="space-y-6">
          {/* Current Periods */}
          {currentPeriods.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Current Periods - Mark Attendance Now
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentPeriods.map((period) => (
                  <Card key={`${period.scheduleId}-${period.periodNumber}`} className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-green-200">
                    <div onClick={() => handlePeriodSelect(period)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="font-semibold text-green-700">Period {period.periodNumber}</span>
                        </div>
                        <span className="text-sm text-gray-500">{period.startTime} - {period.endTime}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{period.subject.name}</h3>
                      <p className="text-sm text-gray-600">{period.className}</p>
                      {period.roomNumber && (
                        <p className="text-sm text-gray-500">Room: {period.roomNumber}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Active Now
                        </span>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Mark Attendance
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Periods */}
          {upcomingPeriods.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Upcoming Periods
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingPeriods.map((period) => (
                  <Card key={`${period.scheduleId}-${period.periodNumber}`} className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-blue-700">Period {period.periodNumber}</span>
                      <span className="text-sm text-gray-500">{period.startTime} - {period.endTime}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{period.subject.name}</h3>
                    <p className="text-sm text-gray-600">{period.className}</p>
                    {period.roomNumber && (
                      <p className="text-sm text-gray-500">Room: {period.roomNumber}</p>
                    )}
                    <div className="mt-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Starts at {period.startTime}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentPeriods.length === 0 && upcomingPeriods.length === 0 && (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <Clock className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">No Active Periods</h3>
                <p className="text-gray-600">
                  You don't have any active periods right now. Check back during your scheduled class times.
                </p>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* Student Attendance Marking */
        <div className="space-y-6">
          {/* Period Info */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-900">
                  {selectedPeriod.subject.name} - Period {selectedPeriod.periodNumber}
                </h2>
                <p className="text-blue-700">{selectedPeriod.className}</p>
                <p className="text-sm text-blue-600">
                  {selectedPeriod.startTime} - {selectedPeriod.endTime}
                  {selectedPeriod.roomNumber && ` • Room: ${selectedPeriod.roomNumber}`}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">{students.length} Students</span>
                </div>
                {periodInfo?.attendanceAlreadyMarked && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Already Marked
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-4 mb-4">
            <Button
              onClick={() => handleMarkAll('present')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Present
            </Button>
            <Button
              onClick={() => handleMarkAll('absent')}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Mark All Absent
            </Button>
          </div>

          {/* Students List */}
          <Card className="p-4">
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                      {student.rollNumber}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-500">Roll: {student.rollNumber}</p>
                    </div>
                    {student.currentStatus && (
                      <div className="flex items-center gap-1">
                        {getStatusIcon(student.currentStatus)}
                        <span className="text-sm text-gray-600">
                          Currently: {student.currentStatus}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {['present', 'absent', 'late', 'excused'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleAttendanceChange(student.id, status)}
                        className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                          attendanceData[student.id] === status
                            ? getStatusColor(status)
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(status)}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              onClick={submitAttendance}
              disabled={submitting || students.some(student => !attendanceData[student.id])}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceView;