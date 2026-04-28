import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, MapPin, Calendar, Trash2, Ban, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getAllUsers, toggleBlockUser } from '../../../services/adminService';
import API from '../../../services/api';

interface Farmer {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  addresses?: any[];
  createdAt: string;
  isBlocked: boolean;
  role: string;
}

export const AdminFarmers: React.FC = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers('farmer');
      setFarmers(data);
    } catch (error) {
      toast.error('Failed to load farmers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (f.email && f.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    f.phone.includes(searchTerm)
  );

  const toggleStatus = async (id: string) => {
    try {
      await toggleBlockUser(id);
      const farmer = farmers.find(f => f._id === id);
      toast.success(`Farmer ${farmer?.name} has been ${farmer?.isBlocked ? 'activated' : 'suspended'}`);
      fetchFarmers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update farmer status');
      console.error(error);
    }
  };

  const deleteFarmer = async (id: string) => {
    const farmer = farmers.find(f => f._id === id);
    
    if (!confirm(`Are you sure you want to delete farmer "${farmer?.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('Farmer deleted successfully');
      fetchFarmers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete farmer');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading farmers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Manage Farmers</h1>
          <p className="text-gray-600 text-sm sm:text-base">View and manage registered farmers on the platform</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border-2 border-green-200 shadow-sm flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium text-gray-600">Total Farmers:</span>
          <span className="text-lg font-bold text-green-700">{farmers.length}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border-2 border-green-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Farmers Table */}
      <div className="bg-white rounded-xl shadow-md border-2 border-green-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[560px]">
            <thead className="bg-green-50 border-b-2 border-green-100">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-green-800 text-sm">Farmer Info</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-green-800 text-sm">Location</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-green-800 text-sm">Joined</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-green-800 text-sm">Status</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-green-800 text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {filteredFarmers.map((farmer) => (
                <tr key={farmer._id} className="hover:bg-green-50/50 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                        {farmer.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{farmer.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Phone className="h-3 w-3 text-green-600 shrink-0" />
                          {farmer.phone}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Mail className="h-3 w-3 text-blue-500 shrink-0" />
                          <span className="truncate max-w-[100px]">{farmer.email || <span className="italic text-gray-400">No email</span>}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-start gap-1 text-gray-600 text-xs sm:text-sm">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                      <span className="break-words max-w-[100px]">
                        {farmer.addresses && farmer.addresses.length > 0 
                          ? `${farmer.addresses[0].village || ''}, ${farmer.addresses[0].district || ''}`
                          : 'Not provided'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-1 text-gray-600 text-xs sm:text-sm">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      {new Date(farmer.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      !farmer.isBlocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {!farmer.isBlocked ? 'active' : 'suspended'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex justify-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => toggleStatus(farmer._id)}
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                          !farmer.isBlocked ? 'text-orange-600 hover:bg-orange-100' : 'text-green-600 hover:bg-green-100'
                        }`}
                        title={!farmer.isBlocked ? 'Suspend Farmer' : 'Activate Farmer'}
                      >
                        {!farmer.isBlocked ? <Ban className="h-4 w-4 sm:h-5 sm:w-5" /> : <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </button>
                      <button
                        onClick={() => deleteFarmer(farmer._id)}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Farmer"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredFarmers.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No farmers found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
