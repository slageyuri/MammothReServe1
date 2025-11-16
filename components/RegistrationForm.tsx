import React, { useState } from 'react';

interface RegistrationFormProps {
  role: 'student-group' | 'food-bank';
  onRegister: (data: any) => void;
  onBack: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ role, onRegister, onBack }) => {
  const [formData, setFormData] = useState<any>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(formData);
  };
  
  const isStudentGroup = role === 'student-group';
  const title = isStudentGroup ? 'Student Group Registration' : 'Food Bank / Institution Registration';

  return (
    <div className="min-h-screen bg-base-200 flex flex-col justify-center items-center p-4">
      <div className="max-w-2xl w-full bg-base-100 p-8 sm:p-12 rounded-2xl shadow-lg border border-base-300">
        <h1 className="text-2xl font-bold text-neutral-content mb-2">{title}</h1>
        <p className="text-gray-400 mb-6">Your application will be sent to Dining Hall Staff for approval.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isStudentGroup ? (
              <>
                <Input name="groupName" label="Group Name" onChange={handleChange} required />
                <Input name="college" label="College Affiliation" onChange={handleChange} required />
                <Input name="memberCount" label="Number of Members" type="number" onChange={handleChange} required />
              </>
            ) : (
              <>
                <Input name="businessName" label="Business / Institution Name" onChange={handleChange} required />
                <Input name="managerName" label="Manager Name" onChange={handleChange} required />
                <Input name="location" label="Location (Address)" onChange={handleChange} required />
                <Input name="purpose" label="Purpose / Mission" onChange={handleChange} required />
              </>
            )}
            <Input name="email" label="Contact Email" type="email" onChange={handleChange} required />
            <Input name="phoneNumber" label="Contact Phone Number" type="tel" onChange={handleChange} required />
          </div>
          <div className="pt-4 flex items-center justify-between">
            <button type="button" onClick={onBack} className="text-sm font-medium text-gray-400 hover:text-primary">
              &larr; Back to Sign In
            </button>
            <button type="submit" className="px-6 py-2 font-medium text-white bg-primary hover:bg-primary-focus rounded-md shadow-sm">
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper component for form inputs
const Input = ({ label, name, type = 'text', onChange, required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-300">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      onChange={onChange}
      required={required}
      className="mt-1 block w-full px-3 py-2 bg-base-300 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-content"
    />
  </div>
);

export default RegistrationForm;