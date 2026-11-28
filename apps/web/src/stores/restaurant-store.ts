import { create } from "zustand";

export interface RestaurantBranch {
  id: string;
  name: string;
  code: string;
  city: string;
  gstin: string;
  fssai: string;
}

export interface SessionUser {
  id?: string;
  name: string;
  email: string;
  role: string;
}

export interface StoreOrganization {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string | null;
  status?: string;
  subscriptionPlan?: string;
}

export interface ActiveBranchView {
  id: string;
  name: string;
  code: string;
  city: string;
  address?: string;
  phone?: string;
  gstin: string;
  fssai?: string;
  fssaiNumber?: string;
  state?: string;
}

const NEUTRAL_BRANCH: ActiveBranchView = {
  id: "",
  name: "Loading Outlet...",
  code: "---",
  city: "",
  gstin: "",
  fssai: "",
  fssaiNumber: "",
};

interface RestaurantState {
  organizations: StoreOrganization[];
  branches: ActiveBranchView[];
  currentUser: SessionUser | null;
  currentOrgId: string;
  currentBranchId: string;
  isSidebarCollapsed: boolean;
  isSearchOpen: boolean;
  setOrganization: (orgId: string) => void;
  setBranch: (branchId: string) => void;
  setSessionData: (data: {
    user?: SessionUser | null;
    organization?: StoreOrganization | any;
    branches?: (RestaurantBranch | ActiveBranchView)[];
  }) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  getActiveBranch: () => ActiveBranchView;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  organizations: [],
  branches: [],
  currentUser: null,
  currentOrgId: "",
  currentBranchId: "",
  isSidebarCollapsed: false,
  isSearchOpen: false,

  setOrganization: (orgId) => set({ currentOrgId: orgId }),
  setBranch: (branchId) => set({ currentBranchId: branchId }),
  setSessionData: (data) =>
    set((state) => {
      const branches =
        data.branches && data.branches.length > 0
          ? data.branches.map((b: any) => ({
              ...b,
              fssai: b.fssai || b.fssaiNumber || "",
              fssaiNumber: b.fssaiNumber || b.fssai || "",
            }))
          : state.branches;
      const organizations = data.organization
        ? [data.organization]
        : state.organizations;
      return {
        currentUser: data.user !== undefined ? data.user : state.currentUser,
        organizations,
        branches,
        currentOrgId: data.organization?.id || state.currentOrgId,
        currentBranchId: branches[0]?.id || state.currentBranchId,
      };
    }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),

  getActiveBranch: () => {
    const { branches, currentBranchId } = get();
    return branches.find((b) => b.id === currentBranchId) || branches[0] || NEUTRAL_BRANCH;
  },
}));
