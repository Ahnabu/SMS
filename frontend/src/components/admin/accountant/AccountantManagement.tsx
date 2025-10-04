import React, { useState } from "react";
import AccountantList, { Accountant } from "./AccountantList";
import AccountantForm from "./AccountantForm";
import { X } from "lucide-react";

const AccountantManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedAccountant, setSelectedAccountant] = useState<Accountant | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleCreateAccountant = () => {
    setSelectedAccountant(null);
    setShowForm(true);
  };

  const handleEditAccountant = (accountant: Accountant) => {
    setSelectedAccountant(accountant);
    setShowForm(true);
  };

  const handleViewAccountant = (accountant: Accountant) => {
    setSelectedAccountant(accountant);
    setShowDetail(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedAccountant(null);
  };

  const handleFormSuccess = () => {
    // The AccountantList will automatically refresh via its internal state
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedAccountant(null);
  };

  return (
    <div className="space-y-6">
      {/* Accountant List */}
      <AccountantList
        onCreateAccountant={handleCreateAccountant}
        onEditAccountant={handleEditAccountant}
        onViewAccountant={handleViewAccountant}
      />

      {/* Accountant Form Modal */}
      <AccountantForm
        accountant={selectedAccountant}
        isOpen={showForm}
        onClose={handleCloseForm}
        onSave={handleFormSuccess}
      />

      {/* Detail View Modal (Placeholder) */}
      {showDetail && selectedAccountant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Accountant Details
              </h2>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedAccountant.user?.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedAccountant.accountantId}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Designation</p>
                    <p className="text-base text-gray-900">{selectedAccountant.designation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-base text-gray-900">{selectedAccountant.department}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Experience</p>
                    <p className="text-base text-gray-900">{selectedAccountant.totalExperience} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Blood Group</p>
                    <p className="text-base text-gray-900">{selectedAccountant.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-base text-gray-900">{selectedAccountant.user?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-base text-gray-900">{selectedAccountant.user?.phone || "N/A"}</p>
                  </div>
                </div>

                {selectedAccountant.certifications && selectedAccountant.certifications.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Certifications</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedAccountant.certifications.map((cert, idx) => (
                        <li key={idx} className="text-base text-gray-900">{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedAccountant.responsibilities && selectedAccountant.responsibilities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Responsibilities</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedAccountant.responsibilities.map((resp, idx) => (
                        <li key={idx} className="text-base text-gray-900">{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCloseDetail}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleCloseDetail();
                    handleEditAccountant(selectedAccountant);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantManagement;
