import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../services/admin.api";
import { useAuth } from "../../context/AuthContext";

interface Schedule {
  _id: string;
  dayOfWeek: string;
  grade: string;
  section: string;
  academicYear: string;
  periods: SchedulePeriod[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SchedulePeriod {
  periodNumber: number;
  subject?: {
    _id: string;
    name: string;
    code: string;
  };
  subjectId?: {
    _id: string;
    name: string;
    code: string;
  };
  teacher?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  teacherId?: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
    };
  };
  startTime: string;
  endTime: string;
  venue?: string;
  roomNumber?: string;
  isBreak: boolean;
  breakType?: "short" | "lunch" | "long";
  breakDuration?: number;
}

interface Period {
  periodNumber: number;
  subject?: {
    _id: string;
    name: string;
    code: string;
  };
  teacher?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      fullName: string;
    };
  };
  startTime: string;
  endTime: string;
  venue?: string;
  isBreak: boolean;
  breakType?: "short" | "lunch" | "long";
  breakDuration?: number;
}

const ScheduleManagement: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    dayOfWeek: "monday",
    grade: "",
    section: "",
    academicYear: new Date().getFullYear().toString(),
    periods: [] as Period[],
  });
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSchedules();
      const schedulesData = response.data.data || [];
      console.log('🔍 Schedules fetched:', schedulesData);
      console.log('🔍 First schedule periods:', schedulesData[0]?.periods);
      console.log('🔍 Subject data in periods:', schedulesData[0]?.periods?.map((p:any) => ({ 
        periodNumber: p.periodNumber,
        subject: getSubjectName(p),
        isBreak: p.isBreak
      })));
      setSchedules(schedulesData);
    } catch (error) {
      toast.error("Error fetching schedules");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      if (!user) {
        console.warn('⚠️ No user context - cannot fetch subjects');
        return;
      }

      const response = await adminApi.getSubjects();
      const subjectsArray = response.data.data || [];
      setSubjects(subjectsArray);
    } catch (error: any) {
      console.error("❌ Error fetching subjects:", error);
      toast.error("Failed to fetch subjects");
    }
  }, [user]);

  const fetchTeachers = useCallback(async () => {
    try {
      const response = await adminApi.getTeachers();
      setTeachers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  }, []);

  // Fetch data when user context changes
  useEffect(() => {
    fetchSchedules();
    fetchSubjects();
    fetchTeachers();
  }, [user, fetchSchedules, fetchSubjects, fetchTeachers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transform data to match backend expected format
      const transformedFormData = {
        schoolId: user?.schoolId || "",
        grade: parseInt(formData.grade),
        section: formData.section.toUpperCase(),
        academicYear: formData.academicYear.includes("-")
          ? formData.academicYear
          : `${formData.academicYear}-${parseInt(formData.academicYear) + 1}`,
        dayOfWeek: formData.dayOfWeek,
        periods: formData.periods.map((period) => ({
          periodNumber: period.periodNumber,
          subjectId: period.subject?._id,
          teacherId: period.teacher?.id,
          roomNumber: period.venue,
          startTime: period.startTime,
          endTime: period.endTime,
          isBreak: period.isBreak,
          breakType: period.isBreak ? period.breakType || "short" : undefined,
          breakDuration: period.isBreak
            ? period.breakDuration || 15
            : undefined,
        })),
      };

      if (editingSchedule) {
        await adminApi.updateSchedule(editingSchedule._id, transformedFormData);
        toast.success("Schedule updated successfully");
      } else {
        await adminApi.createSchedule(transformedFormData);
        toast.success("Schedule created successfully");
      }

      setIsFormOpen(false);
      setEditingSchedule(null);
      resetForm();
      fetchSchedules();
    } catch (error) {
      console.error("Schedule creation error:", error);
      toast.error("Error saving schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;

    setLoading(true);
    try {
      await adminApi.deleteSchedule(scheduleId);
      toast.success("Schedule deleted successfully");
      fetchSchedules();
    } catch (error) {
      toast.error("Error deleting schedule");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      dayOfWeek: "monday",
      grade: "",
      section: "",
      academicYear: new Date().getFullYear().toString(),
      periods: [],
    });
  };

  const addPeriod = () => {
    const newPeriod: Period = {
      periodNumber: formData.periods.length + 1,
      startTime: "09:00",
      endTime: "09:45",
      isBreak: false,
    };
    setFormData({
      ...formData,
      periods: [...formData.periods, newPeriod],
    });
  };

  const updatePeriod = (index: number, updatedPeriod: Partial<Period>) => {
    const updatedPeriods = formData.periods.map((period, i) =>
      i === index ? { ...period, ...updatedPeriod } : period
    );
    setFormData({ ...formData, periods: updatedPeriods });
  };

  const removePeriod = (index: number) => {
    const updatedPeriods = formData.periods
      .filter((_, i) => i !== index)
      .map((period, i) => ({ ...period, periodNumber: i + 1 }));
    setFormData({ ...formData, periods: updatedPeriods });
  };

  const openEditForm = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      dayOfWeek: schedule.dayOfWeek, // Backend should return lowercase, frontend expects lowercase
      grade: schedule.grade,
      section: schedule.section,
      academicYear: schedule.academicYear,
      periods: schedule.periods.map((period) => ({
        ...period,
        subject: period.subject || (period as any).subjectId || undefined,
        teacher: period.teacher
          ? {
              id: period.teacher._id,
              user: {
                firstName: period.teacher.firstName,
                lastName: period.teacher.lastName,
                fullName: `${period.teacher.firstName} ${period.teacher.lastName}`,
              },
            }
          : (period as any).teacherId
          ? {
              id: (period as any).teacherId._id,
              user: {
                firstName: (period as any).teacherId.userId?.firstName || "",
                lastName: (period as any).teacherId.userId?.lastName || "",
                fullName: `${(period as any).teacherId.userId?.firstName || ""} ${(period as any).teacherId.userId?.lastName || ""}`,
              },
            }
          : undefined,
        venue: period.venue || period.roomNumber || "",
        breakType: period.breakType,
        breakDuration: period.isBreak ? period.breakDuration || 15 : undefined,
      })),
    });
    setIsFormOpen(true);
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupSchedulesByClass = () => {
    const grouped: { [key: string]: Schedule[] } = {};
    schedules.forEach((schedule) => {
      const key = `${schedule.grade}-${schedule.section}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(schedule);
    });
    return grouped;
  };

  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
  ];

  // Helper functions to safely extract data
  const getSubjectName = (period: SchedulePeriod) => {
    if (period.subject?.name) return period.subject.name;
    if ((period as any).subjectId?.name) return (period as any).subjectId.name;
    return "Free";
  };

  const getTeacherName = (period: SchedulePeriod) => {
    if (period.teacher?.firstName && period.teacher?.lastName) {
      return `${period.teacher.firstName} ${period.teacher.lastName}`;
    }
    if ((period as any).teacherId?.userId?.firstName && (period as any).teacherId?.userId?.lastName) {
      return `${(period as any).teacherId.userId.firstName} ${(period as any).teacherId.userId.lastName}`;
    }
    return null;
  };

  const getVenue = (period: SchedulePeriod) => {
    return period.venue || period.roomNumber || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Schedule Management
            </h1>
            <p className="text-gray-600 text-lg">Manage class timetables and periods</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => window.open('/admin/subjects', '_blank')}
              className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 shadow-sm"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Manage Subjects
            </Button>
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
            >
              {viewMode === "grid" ? "List View" : "Grid View"}
            </Button>
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </div>
        </div>

      {/* Schedule Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-semibold">
                {editingSchedule ? "Edit Schedule" : "Create New Schedule"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Day of Week*
                    </label>
                    <Select
                      value={formData.dayOfWeek}
                      onValueChange={(value) =>
                        setFormData({ ...formData, dayOfWeek: value })
                      }
                    >
                      <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 rounded-lg">
                        <SelectValue placeholder="Select Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="grade"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Grade*
                    </label>
                    <Input
                      id="grade"
                      value={formData.grade}
                      onChange={(e) =>
                        setFormData({ ...formData, grade: e.target.value })
                      }
                      placeholder="e.g., 10"
                      className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="section"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Section*
                    </label>
                    <Input
                      id="section"
                      value={formData.section}
                      onChange={(e) =>
                        setFormData({ ...formData, section: e.target.value })
                      }
                      placeholder="e.g., A"
                      className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="academicYear"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Academic Year*
                    </label>
                    <Input
                      id="academicYear"
                      value={formData.academicYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academicYear: e.target.value,
                        })
                      }
                      placeholder="e.g., 2024"
                      className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">Periods</h3>
                    <Button 
                      type="button" 
                      onClick={addPeriod} 
                      variant="outline"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 shadow-md"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Period
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {formData.periods.map((period, index) => (
                      <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 hover:border-blue-300 p-6 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-lg text-gray-800">
                            Period {period.periodNumber}
                          </h4>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <input
                                aria-label="Break"
                                type="checkbox"
                                checked={period.isBreak}
                                onChange={(e) =>
                                  updatePeriod(index, {
                                    isBreak: e.target.checked,
                                  })
                                }
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <label className="text-sm font-medium text-gray-700">Break Period</label>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removePeriod(index)}
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* First Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Start Time*
                            </label>
                            <Input
                              type="time"
                              value={period.startTime}
                              onChange={(e) =>
                                updatePeriod(index, {
                                  startTime: e.target.value,
                                })
                              }
                              className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 rounded-lg"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              End Time*
                            </label>
                            <Input
                              type="time"
                              value={period.endTime}
                              onChange={(e) =>
                                updatePeriod(index, { endTime: e.target.value })
                              }
                              className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 rounded-lg"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Subject
                            </label>
                            <div className="flex gap-2">
                              <Select
                                value={period.subject?._id || ""}
                                onValueChange={(value) => {
                                  const subject = subjects.find(
                                    (s: any) => s._id === value
                                  );
                                  updatePeriod(index, { subject });
                                }}
                              >
                                <SelectTrigger className="flex-1 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 rounded-lg">
                                  <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  {subjects && Array.isArray(subjects) && subjects.length > 0 ? (
                                    subjects.map((subject: any) => (
                                      <SelectItem
                                        key={subject._id}
                                        value={subject._id}
                                      >
                                        {subject.name} ({subject.code})
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-subjects" disabled>
                                      No subjects available - Please add subjects first
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={fetchSubjects}
                                title="Refresh subjects"
                                className="border-2 border-gray-200 hover:border-blue-300"
                              >
                                🔄
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Venue
                            </label>
                            <Input
                              value={period.venue || ""}
                              onChange={(e) =>
                                updatePeriod(index, { venue: e.target.value })
                              }
                              placeholder="Room/Hall"
                              className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Second Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Teacher
                            </label>
                            <Select
                              value={period.teacher?.id || ""}
                              onValueChange={(value) => {
                                const teacher = teachers.find(
                                  (t: any) => t.id === value
                                );
                                updatePeriod(index, { teacher });
                              }}
                            >
                              <SelectTrigger className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 rounded-lg">
                                <SelectValue placeholder="Select Teacher" />
                              </SelectTrigger>
                              <SelectContent>
                                {teachers.map((teacher: any) => (
                                  <SelectItem
                                    key={teacher.id}
                                    value={teacher.id}
                                  >
                                    {teacher.user.firstName}{" "}
                                    {teacher.user.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Break-specific fields */}
                          {period.isBreak && (
                            <>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Break Type*
                                </label>
                                <Select
                                  value={period.breakType || "short"}
                                  onValueChange={(
                                    value: "short" | "lunch" | "long"
                                  ) => updatePeriod(index, { breakType: value })}
                                >
                                  <SelectTrigger className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 rounded-lg">
                                    <SelectValue placeholder="Select Break Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="short">
                                      Short Break
                                    </SelectItem>
                                    <SelectItem value="lunch">
                                      Lunch Break
                                    </SelectItem>
                                    <SelectItem value="long">
                                      Long Break
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Duration (minutes)*
                                </label>
                                <Input
                                  type="number"
                                  min="5"
                                  max="60"
                                  value={period.breakDuration || 15}
                                  onChange={(e) =>
                                    updatePeriod(index, {
                                      breakDuration:
                                        parseInt(e.target.value) || 15,
                                    })
                                  }
                                  placeholder="15"
                                  className="border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 rounded-lg"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !formData.grade ||
                      !formData.section ||
                      formData.periods.length === 0
                    }
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading
                      ? "Saving..."
                      : editingSchedule
                      ? "Update Schedule"
                      : "Create Schedule"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingSchedule(null);
                      resetForm();
                    }}
                    className="px-8 py-3 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedules Display */}
      <div className="space-y-8">
        {viewMode === "grid" ? (
          <div className="space-y-8">
            {Object.entries(groupSchedulesByClass()).map(
              ([classKey, classSchedules]) => (
                <Card key={classKey} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
                    <CardTitle className="text-xl font-semibold">
                      Class {classKey} - Weekly Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="overflow-x-auto rounded-lg shadow-inner">
                      <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                            <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">
                              Time
                            </th>
                            {daysOfWeek.map((day) => (
                              <th
                                key={day.value}
                                className="border border-gray-200 p-4 text-left font-semibold text-gray-700"
                              >
                                {day.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Generate time slots based on periods */}
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((periodNum) => (
                            <tr key={periodNum} className="hover:bg-blue-50/50 transition-colors">
                              <td className="border border-gray-200 p-4 font-medium bg-gradient-to-r from-gray-50 to-blue-50 text-gray-700">
                                Period {periodNum}
                              </td>
                              {daysOfWeek.map((day) => {
                                const daySchedule = classSchedules.find(
                                  (s) => s.dayOfWeek === day.value
                                );
                                const period = daySchedule?.periods.find(
                                  (p) => p.periodNumber === periodNum
                                );

                                return (
                                  <td
                                    key={`${day.value}-${periodNum}`}
                                    className="border border-gray-200 p-4"
                                  >
                                    {period ? (
                                      <div className="text-sm space-y-1">
                                        <div className="font-semibold text-gray-800">
                                          {period.isBreak
                                            ? "🕐 Break"
                                            : `📚 ${getSubjectName(period)}`}
                                        </div>
                                        {!period.isBreak && getTeacherName(period) && (
                                          <div className="text-blue-600 font-medium">
                                            👨‍🏫 {getTeacherName(period)}
                                          </div>
                                        )}
                                        <div className="text-gray-500 text-xs">
                                          ⏰ {formatTime(period.startTime)} -{" "}
                                          {formatTime(period.endTime)}
                                        </div>
                                        {getVenue(period) && (
                                          <div className="text-purple-600 text-xs font-medium">
                                            📍 {getVenue(period)}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-gray-400 text-sm text-center">
                                        -
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-6">
                      {classSchedules.map((schedule) => (
                        <div key={schedule._id} className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditForm(schedule)}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 shadow-sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit{" "}
                            {daysOfWeek.find(
                              (d) => d.value === schedule.dayOfWeek
                            )?.label || schedule.dayOfWeek}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-xl font-semibold">All Schedules</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading schedules...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule._id}
                      className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg text-gray-800">
                            📚 Class {schedule.grade}-{schedule.section} -{" "}
                            {daysOfWeek.find(
                              (d) => d.value === schedule.dayOfWeek
                            )?.label || schedule.dayOfWeek}
                          </h3>
                          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                            {schedule.periods.length} periods
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>Academic Year: {schedule.academicYear}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span>
                              {schedule.periods.length > 0 &&
                                `${formatTime(
                                  schedule.periods[0].startTime
                                )} - ${formatTime(
                                  schedule.periods[schedule.periods.length - 1]
                                    .endTime
                                )}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(schedule)}
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(schedule._id)}
                          className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {schedules.length === 0 && (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">📅</div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No schedules found</h3>
                      <p className="text-gray-500 mb-6">Create your first schedule to get started!</p>
                      <Button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Schedule
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;
