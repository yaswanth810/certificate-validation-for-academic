import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, DollarSign, Users, BookOpen, Building, Clock } from 'lucide-react';
import { CreateScholarshipParams } from '../../hooks/useScholarshipAdmin';
import TokenSelector from '../TokenSelector';
import { TokenInfo } from '../../types/scholarship';
import { ScholarshipCreateProgress } from '../ui/ProgressIndicator';

interface ScholarshipFormProps {
  onSubmit: (data: CreateScholarshipParams) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<CreateScholarshipParams>;
  onCancel?: () => void;
}

type FormStep = 'details' | 'criteria' | 'funding' | 'review';

const ScholarshipForm: React.FC<ScholarshipFormProps> = ({
  onSubmit,
  loading = false,
  initialData,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('details');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedToken, setSelectedToken] = useState<TokenInfo | undefined>();

  const [formData, setFormData] = useState<CreateScholarshipParams>({
    name: '',
    description: '',
    totalAmount: '',
    maxRecipients: 10,
    deadline: 0,
    tokenAddress: '0x0',
    tokenSymbol: 'ETH',
    criteria: {
      minGPA: 0,
      requiredCourses: [],
      allowedDepartments: [],
      minCertificates: 1,
      enrollmentAfter: 0,
      enrollmentBefore: 0,
      requiresAllCourses: false
    },
    ...initialData
  });

  // Update form data when token is selected
  useEffect(() => {
    if (selectedToken) {
      setFormData(prev => ({
        ...prev,
        tokenAddress: selectedToken.address,
        tokenSymbol: selectedToken.symbol
      }));
    }
  }, [selectedToken]);

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'details':
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.deadline <= Date.now() / 1000) newErrors.deadline = 'Deadline must be in the future';
        break;

      case 'criteria':
        if (formData.criteria.minCertificates < 0) newErrors.minCertificates = 'Must be 0 or greater';
        if (formData.criteria.minGPA < 0 || formData.criteria.minGPA > 400) {
          newErrors.minGPA = 'GPA must be between 0 and 4.0';
        }
        break;

      case 'funding':
        if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
          newErrors.totalAmount = 'Amount must be greater than 0';
        }
        if (formData.maxRecipients <= 0) newErrors.maxRecipients = 'Must have at least 1 recipient';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const steps: FormStep[] = ['details', 'criteria', 'funding', 'review'];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const handlePrevious = () => {
    const steps: FormStep[] = ['details', 'criteria', 'funding', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (validateStep('funding')) {
      await onSubmit(formData);
    }
  };

  const updateFormData = (field: keyof CreateScholarshipParams, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateCriteria = (field: keyof CreateScholarshipParams['criteria'], value: any) => {
    setFormData(prev => ({
      ...prev,
      criteria: { ...prev.criteria, [field]: value }
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addCourse = () => {
    updateCriteria('requiredCourses', [...formData.criteria.requiredCourses, '']);
  };

  const removeCourse = (index: number) => {
    const courses = formData.criteria.requiredCourses.filter((_, i) => i !== index);
    updateCriteria('requiredCourses', courses);
  };

  const updateCourse = (index: number, value: string) => {
    const courses = [...formData.criteria.requiredCourses];
    courses[index] = value;
    updateCriteria('requiredCourses', courses);
  };

  const addDepartment = () => {
    updateCriteria('allowedDepartments', [...formData.criteria.allowedDepartments, '']);
  };

  const removeDepartment = (index: number) => {
    const departments = formData.criteria.allowedDepartments.filter((_, i) => i !== index);
    updateCriteria('allowedDepartments', departments);
  };

  const updateDepartment = (index: number, value: string) => {
    const departments = [...formData.criteria.allowedDepartments];
    departments[index] = value;
    updateCriteria('allowedDepartments', departments);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'details':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Basic Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Set up the basic information for your scholarship
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scholarship Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="e.g., Excellence in Computer Science"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Describe the scholarship purpose, goals, and any special requirements..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Application Deadline *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="datetime-local"
                    value={formData.deadline ? new Date(formData.deadline * 1000).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateFormData('deadline', new Date(e.target.value).getTime() / 1000)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.deadline ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
                {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
              </div>
            </div>
          </div>
        );

      case 'criteria':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Eligibility Criteria
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Define who can apply for this scholarship
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum GPA (0-4.0)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    step="0.1"
                    value={formData.criteria.minGPA / 100}
                    onChange={(e) => updateCriteria('minGPA', parseFloat(e.target.value) * 100)}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.minGPA ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="3.5"
                  />
                  {errors.minGPA && <p className="mt-1 text-sm text-red-600">{errors.minGPA}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Certificates
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.criteria.minCertificates}
                    onChange={(e) => updateCriteria('minCertificates', parseInt(e.target.value))}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.minCertificates ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="1"
                  />
                  {errors.minCertificates && <p className="mt-1 text-sm text-red-600">{errors.minCertificates}</p>}
                </div>
              </div>

              {/* Required Courses */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Required Courses
                  </label>
                  <button
                    type="button"
                    onClick={addCourse}
                    className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Course</span>
                  </button>
                </div>
                
                {formData.criteria.requiredCourses.length > 0 && (
                  <div className="mb-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.criteria.requiresAllCourses}
                        onChange={(e) => updateCriteria('requiresAllCourses', e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Require ALL courses (unchecked = require ANY course)
                      </span>
                    </label>
                  </div>
                )}

                <div className="space-y-2">
                  {formData.criteria.requiredCourses.map((course, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={course}
                        onChange={(e) => updateCourse(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Course name"
                      />
                      <button
                        type="button"
                        onClick={() => removeCourse(index)}
                        className="text-red-600 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allowed Departments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allowed Departments
                  </label>
                  <button
                    type="button"
                    onClick={addDepartment}
                    className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Department</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.criteria.allowedDepartments.map((department, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => updateDepartment(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Department name"
                      />
                      <button
                        type="button"
                        onClick={() => removeDepartment(index)}
                        className="text-red-600 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enrollment Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enrolled After (Optional)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={formData.criteria.enrollmentAfter ? new Date(formData.criteria.enrollmentAfter * 1000).toISOString().split('T')[0] : ''}
                      onChange={(e) => updateCriteria('enrollmentAfter', e.target.value ? new Date(e.target.value).getTime() / 1000 : 0)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enrolled Before (Optional)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={formData.criteria.enrollmentBefore ? new Date(formData.criteria.enrollmentBefore * 1000).toISOString().split('T')[0] : ''}
                      onChange={(e) => updateCriteria('enrollmentBefore', e.target.value ? new Date(e.target.value).getTime() / 1000 : 0)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'funding':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Funding Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Set the scholarship amount and distribution
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Token Type
                </label>
                <TokenSelector
                  selectedToken={selectedToken}
                  onTokenSelect={setSelectedToken}
                  showBalance={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={formData.totalAmount}
                      onChange={(e) => updateFormData('totalAmount', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.totalAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="10.0"
                    />
                  </div>
                  {errors.totalAmount && <p className="mt-1 text-sm text-red-600">{errors.totalAmount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Recipients *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      min="1"
                      value={formData.maxRecipients}
                      onChange={(e) => updateFormData('maxRecipients', parseInt(e.target.value))}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.maxRecipients ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="10"
                    />
                  </div>
                  {errors.maxRecipients && <p className="mt-1 text-sm text-red-600">{errors.maxRecipients}</p>}
                </div>
              </div>

              {/* Amount per recipient calculation */}
              {formData.totalAmount && formData.maxRecipients > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Amount per recipient:
                    </span>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {(parseFloat(formData.totalAmount) / formData.maxRecipients).toFixed(6)} {formData.tokenSymbol}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Review & Submit
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Review your scholarship details before submitting
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Basic Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {formData.name}</p>
                  <p><span className="font-medium">Description:</span> {formData.description}</p>
                  <p><span className="font-medium">Deadline:</span> {new Date(formData.deadline * 1000).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Funding</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Total Amount:</span> {formData.totalAmount} {formData.tokenSymbol}</p>
                  <p><span className="font-medium">Max Recipients:</span> {formData.maxRecipients}</p>
                  <p><span className="font-medium">Per Recipient:</span> {(parseFloat(formData.totalAmount) / formData.maxRecipients).toFixed(6)} {formData.tokenSymbol}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Eligibility Criteria</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Min GPA:</span> {formData.criteria.minGPA / 100}</p>
                  <p><span className="font-medium">Min Certificates:</span> {formData.criteria.minCertificates}</p>
                  {formData.criteria.requiredCourses.length > 0 && (
                    <p><span className="font-medium">Required Courses:</span> {formData.criteria.requiredCourses.join(', ')}</p>
                  )}
                  {formData.criteria.allowedDepartments.length > 0 && (
                    <p><span className="font-medium">Allowed Departments:</span> {formData.criteria.allowedDepartments.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <ScholarshipCreateProgress currentStep={currentStep} />
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {currentStep !== 'details' && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}

            {currentStep === 'review' ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>{loading ? 'Creating...' : 'Create Scholarship'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipForm;
