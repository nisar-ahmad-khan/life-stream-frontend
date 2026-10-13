import axios from 'axios';
import API_BASE_URL from './api';

/**
 * Fetch all available donors from Laravel Backend Endpoint:
 * Route::get('/donors', [DonorController::class, 'index'])
 *
 * Controller Response Specs:
 * 1. Donors Found:
 *    HTTP 200 -> { success: true, donors: [...] }
 * 2. Empty Donors List ($donors->isEmpty()):
 *    HTTP 200 -> { success: false, message: "Be the first to give — because somewhere, someone's life is waiting on your courage to show up." }
 * 3. Exception / Error:
 *    HTTP 200 / Exception -> { success: false, message: "..." }
 *
 * @param {Object} params - Optional filter query parameters (blood_group, status, search, radius)
 * @returns {Promise<{ success: boolean, donors: Array, message?: string, isConnected: boolean }>}
 */
export async function fetchAllDonors(params = {}) {
  const candidateEndpoints = [
    `${API_BASE_URL}/api/donors`,
    `${API_BASE_URL}/donors`,
    `/api/donors`,
    `/donors`,
  ];

  // Prepare clean query params
  const cleanParams = {};
  if (params.bloodGroup && params.bloodGroup !== 'ALL') {
    cleanParams.blood_group = params.bloodGroup;
  }
  if (params.status && params.status !== 'ALL') {
    cleanParams.status = params.status.toLowerCase();
  }
  if (params.search && params.search.trim()) {
    cleanParams.search = params.search.trim();
  }
  if (params.radius) {
    cleanParams.radius = params.radius;
  }

  let rawData = null;
  let isConnected = false;

  for (const url of candidateEndpoints) {
    try {
      const response = await axios.get(url, {
        params: cleanParams,
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response && response.data) {
        rawData = response.data;
        isConnected = true;
        break;
      }
    } catch (err) {
      if (err.response && err.response.data) {
        rawData = err.response.data;
        isConnected = true;
        break;
      }
    }
  }

  if (!isConnected || !rawData) {
    return {
      success: false,
      donors: [],
      message: 'Laravel Backend is offline or unreachable. Displaying initial demo dataset.',
      isConnected: false,
    };
  }

  // Handle case when controller returns { success: false, message: "..." } (e.g. empty donors or exception)
  if (rawData.success === false) {
    return {
      success: false,
      donors: [],
      message: rawData.message || "Be the first to give — because somewhere, someone's life is waiting on your courage to show up.",
      isConnected: true,
    };
  }

  // Safely extract donors array from response object
  let rawList = [];
  if (Array.isArray(rawData.donors)) {
    rawList = rawData.donors;
  } else if (Array.isArray(rawData)) {
    rawList = rawData;
  } else if (Array.isArray(rawData?.donors?.data)) {
    rawList = rawData.donors.data;
  } else if (Array.isArray(rawData?.data)) {
    rawList = rawData.data;
  }

  // Map Eloquent Donor model & eager-loaded User relationship to standard frontend fields
  const normalizedDonors = rawList.map((item, index) => {
    const userObj = item.user || {};

    const name =
      userObj.name ||
      userObj.full_name ||
      userObj.fullName ||
      item.name ||
      item.full_name ||
      item.fullName ||
      'Anonymous Donor';

    const phone =
      userObj.phone_number ||
      userObj.phone ||
      userObj.phoneNumber ||
      item.phone ||
      item.phone_number ||
      item.contact_number ||
      'N/A';

    const bloodGroup =
      item.blood_group ||
      item.bloodGroup ||
      item.blood_type ||
      userObj.blood_group ||
      userObj.bloodGroup ||
      'O+';

    const address =
      item.address ||
      item.location ||
      item.city ||
      userObj.address ||
      userObj.city ||
      'Location not specified';

    const rawLastDate =
      item.last_donation_date ||
      item.lastDonationDate ||
      item.last_donated_at ||
      userObj.last_donation_date ||
      '';
    const lastDonationDate =
      typeof rawLastDate === 'string' && rawLastDate.includes('T')
        ? rawLastDate.split('T')[0]
        : rawLastDate || '';

    const isAvailable =
      item.is_available ??
      item.isAvailable ??
      userObj.is_available ??
      true;

    return {
      id: item.id || item.user_id || index + 1,
      name,
      bloodGroup,
      address,
      phone,
      lastDonationDate,
      isAvailable: Boolean(isAvailable),
      user: userObj,
      raw: item,
    };
  });

  return {
    success: true,
    donors: normalizedDonors,
    message: null,
    isConnected: true,
  };
}
