import React, { useState, useEffect, useCallback } from "react";
import { parentApi } from "../../services/parent.api";

interface ChildHomeworkViewProps {
  selectedChild: any;
}

export const ChildHomeworkView: React.FC<ChildHomeworkViewProps> = ({
  selectedChild,
}) => {
  const [homeworkData, setHomeworkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadHomeworkData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await parentApi.getChildHomework(selectedChild.id);
      if (response.data.success) {
        setHomeworkData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load homework data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedChild]);

  useEffect(() => {
    if (selectedChild) {
      loadHomeworkData();
    }
  }, [selectedChild, loadHomeworkData]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "pending":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "overdue":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      case "submitted":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {selectedChild
                ? `${selectedChild.firstName}'s Homework`
                : "Child Homework"}
            </h1>
            <p className="text-purple-100 text-sm sm:text-base">
              Monitor assignments, track progress, and stay updated on homework
              submissions
            </p>
          </div>
          <div className="mt-4 sm:mt-0 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center text-sm">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span>Homework Tracker</span>
            </div>
          </div>
        </div>
      </div>

      {/* Homework Summary */}
      {homeworkData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-sm p-4 sm:p-6 border border-green-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-200 rounded-lg">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-green-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-green-700 font-medium">
                  Completed
                </p>
                <p className="text-lg sm:text-2xl font-bold text-green-900">
                  {homeworkData.summary.completed || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg shadow-sm p-4 sm:p-6 border border-yellow-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-200 rounded-lg">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-yellow-700 font-medium">
                  Pending
                </p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-900">
                  {homeworkData.summary.pending || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg shadow-sm p-4 sm:p-6 border border-red-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-200 rounded-lg">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-red-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-red-700 font-medium">
                  Overdue
                </p>
                <p className="text-lg sm:text-2xl font-bold text-red-900">
                  {homeworkData.summary.overdue || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm p-4 sm:p-6 border border-blue-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-200 rounded-lg">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-blue-700 font-medium">
                  Submitted
                </p>
                <p className="text-lg sm:text-2xl font-bold text-blue-900">
                  {homeworkData.summary.submitted || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Homework List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
          Assignments
        </h3>

        {homeworkData?.assignments && homeworkData.assignments.length > 0 ? (
          <div className="space-y-4">
            {homeworkData.assignments.map((assignment: any, index: number) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div className="flex-1 mb-3 sm:mb-0">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {assignment.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {assignment.subject}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>
                        Assigned:{" "}
                        {new Date(assignment.assignedDate).toLocaleDateString()}
                      </span>
                      <span>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      {assignment.teacher && (
                        <span>Teacher: {assignment.teacher}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        assignment.status
                      )}`}
                    >
                      <span className="mr-1">
                        {getStatusIcon(assignment.status)}
                      </span>
                      {assignment.status}
                    </span>
                  </div>
                </div>

                {assignment.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {assignment.description}
                    </p>
                  </div>
                )}

                {assignment.attachments &&
                  assignment.attachments.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">
                        Attachments:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {assignment.attachments.map(
                          (attachment: any, attIndex: number) => (
                            <a
                              key={attIndex}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              {attachment.name}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {assignment.submission && (
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      Submission:
                    </h5>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-800">
                          Submitted on{" "}
                          {new Date(
                            assignment.submission.submittedAt
                          ).toLocaleDateString()}
                        </span>
                        {assignment.submission.grade && (
                          <span className="text-sm font-bold text-green-700">
                            Grade: {assignment.submission.grade}
                          </span>
                        )}
                      </div>
                      {assignment.submission.feedback && (
                        <p className="text-sm text-green-700 mt-2">
                          {assignment.submission.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {assignment.status === "pending" &&
                  new Date(assignment.dueDate) < new Date() && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-red-600 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <span className="text-sm text-red-800 font-medium">
                          This assignment is overdue!
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Homework Assignments
            </h3>
            <p className="text-gray-500">
              No homework assignments available at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
