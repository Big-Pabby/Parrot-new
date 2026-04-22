export interface Employee {
  _id: string;
  businessId: string;
  name: string;
  employeeId: string;
  position: string;
  department: string;
  profileImage: string;
  reviews: string[];
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface EmployeePaginatedResponse {
  docs: Employee[];
  totalDocs: number;
  page: number;
  limit: number;
  totalPages: number;
}
