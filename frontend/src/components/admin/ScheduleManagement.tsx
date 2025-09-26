import React, { useState, useEffect } from "react";
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
import { Calendar, Clock, Plus, Edit, Trash2 } from "lucide-react";
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
  teacher?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  startTime: string;
  endTime: string;
  venue?: string;
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

  useEffect(() => {
    fetchSchedules();
    fetchSubjects();
    fetchTeachers();
  }, []);
  console.log(teachers);
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSchedules();
      setSchedules(response.data.data || []);
    } catch (error) {
      toast.error("Error fetching schedules");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await adminApi.getSubjects();
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await adminApi.getTeachers();
      setTeachers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

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
        teacher: period.teacher
          ? {
              id: period.teacher._id,
              user: {
                firstName: period.teacher.firstName,
                lastName: period.teacher.lastName,
                fullName: `${period.teacher.firstName} ${period.teacher.lastName}`,
              },
            }
          : undefined,
        breakType: period.breakType,
        breakDuration: period.isBreak ? 15 : undefined, // Default if not provided
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Schedule Management</h1>
          <p className="text-gray-600">Manage class timetables and periods</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? "List View" : "Grid View"}
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      </div>

      {/* Schedule Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingSchedule ? "Edit Schedule" : "Create New Schedule"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Day of Week*
                    </label>
                    <Select
                      value={formData.dayOfWeek}
                      onValueChange={(value) =>
                        setFormData({ ...formData, dayOfWeek: value })
                      }
                    >
                      <SelectTrigger className="w-full">
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
                  <div>
                    <label
                      htmlFor="grade"
                      className="block text-sm font-medium mb-1"
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
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="section"
                      className="block text-sm font-medium mb-1"
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
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="academicYear"
                      className="block text-sm font-medium mb-1"
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
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Periods</h3>
                    <Button type="button" onClick={addPeriod} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Period
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.periods.map((period, index) => (
                      <div key={index} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">
                            Period {period.periodNumber}
                          </h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePeriod(index)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
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
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              End Time*
                            </label>
                            <Input
                              type="time"
                              value={period.endTime}
                              onChange={(e) =>
                                updatePeriod(index, { endTime: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Subject
                            </label>
                            <Select
                              value={period.subject?._id || ""}
                              onValueChange={(value) => {
                                const subject = subjects.find(
                                  (s: any) => s._id === value
                                );
                                updatePeriod(index, { subject });
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects.map((subject: any) => (
                                  <SelectItem
                                    key={subject._id}
                                    value={subject._id}
                                  >
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
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
                              <SelectTrigger className="w-full">
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
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Venue
                            </label>
                            <Input
                              value={period.venue || ""}
                              onChange={(e) =>
                                updatePeriod(index, { venue: e.target.value })
                              }
                              placeholder="Room/Hall"
                            />
                          </div>
                          <div className="flex items-center">
                            <input
                              aria-label="Break"
                              type="checkbox"
                              checked={period.isBreak}
                              onChange={(e) =>
                                updatePeriod(index, {
                                  isBreak: e.target.checked,
                                })
                              }
                              className="h-4 w-4 text-blue-600 rounded mr-2"
                            />
                            <label className="text-sm font-medium">Break</label>
                          </div>
                        </div>

                        {/* Break-specific fields */}
                        {period.isBreak && (
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Break Type*
                              </label>
                              <Select
                                value={period.breakType || "short"}
                                onValueChange={(
                                  value: "short" | "lunch" | "long"
                                ) => updatePeriod(index, { breakType: value })}
                              >
                                <SelectTrigger className="w-full">
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
                            <div>
                              <label className="block text-sm font-medium mb-1">
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
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !formData.grade ||
                      !formData.section ||
                      formData.periods.length === 0
                    }
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
      {viewMode === "grid" ? (
        <div className="space-y-6">
          {Object.entries(groupSchedulesByClass()).map(
            ([classKey, classSchedules]) => (
              <Card key={classKey}>
                <CardHeader>
                  <CardTitle>Class {classKey} - Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 p-2 bg-gray-50">
                            Time
                          </th>
                          {daysOfWeek.map((day) => (
                            <th
                              key={day.value}
                              className="border border-gray-300 p-2 bg-gray-50"
                            >
                              {day.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Generate time slots based on periods */}
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((periodNum) => (
                          <tr key={periodNum}>
                            <td className="border border-gray-300 p-2 font-medium bg-gray-50">
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
                                  className="border border-gray-300 p-2"
                                >
                                  {period ? (
                                    <div className="text-sm">
                                      <div className="font-medium">
                                        {period.isBreak
                                          ? "Break"
                                          : period.subject?.name || "Free"}
                                      </div>
                                      {period.teacher && !period.isBreak && (
                                        <div className="text-gray-600">
                                          {period.teacher.firstName}{" "}
                                          {period.teacher.lastName}
                                        </div>
                                      )}
                                      <div className="text-gray-500">
                                        {formatTime(period.startTime)} -{" "}
                                        {formatTime(period.endTime)}
                                      </div>
                                      {period.venue && (
                                        <div className="text-gray-500 text-xs">
                                          {period.venue}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-gray-400 text-sm">
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
                  <div className="flex gap-2 mt-4">
                    {classSchedules.map((schedule) => (
                      <div key={schedule._id} className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(schedule)}
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
        <Card>
          <CardHeader>
            <CardTitle>All Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading schedules...</p>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div
                    key={schedule._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          Class {schedule.grade}-{schedule.section} -{" "}
                          {daysOfWeek.find(
                            (d) => d.value === schedule.dayOfWeek
                          )?.label || schedule.dayOfWeek}
                        </h3>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {schedule.periods.length} periods
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Academic Year: {schedule.academicYear}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(schedule)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(schedule._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {schedules.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No schedules found. Create your first schedule!
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduleManagement;
