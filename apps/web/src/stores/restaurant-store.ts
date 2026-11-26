import { create } from "zustand";
import { DEMO_BRANCHES, DEMO_RESTAURANTS, RestaurantBranch } from "@/lib/demo-data";

export interface SessionUser {
  id?: string;
  name: string;
  email: string;
  role: string;
}

interface RestaurantState {
  organizations: typeof DEMO_RESTAURANTS;
  branches: RestaurantBranch[];
  currentUser: SessionUser | null;
  currentOrgId: string;
  currentBranchId: string;
  isSidebarCollapsed: boolean;
  isSearchOpen: boolean;
  setOrganization: (orgId: string) => void;
  setBranch: (branchId: string) => void;
  setSessionData: (data: { user?: SessionUser | null; organization?: any; branches?: RestaurantBranch[] }) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  getActiveBranch: () => RestaurantBranch;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  organizations: DEMO_RESTAURANTS,
  branches: DEMO_BRANCHES,
  currentUser: null,
  currentOrgId: DEMO_RESTAURANTS[0].id,
  currentBranchId: DEMO_BRANCHES[0].id,
  isSidebarCollapsed: false,
  isSearchOpen: false,

  setOrganization: (orgId) => set({ currentOrgId: orgId }),
  setBranch: (branchId) => set({ currentBranchId: branchId }),
  setSessionData: (data) =>
    set((state) => {
      const branches = data.branches && data.branches.length > 0 ? data.branches : state.branches;
      const organizations = data.organization ? [data.organization] : state.organizations;
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
    return branches.find((b) => b.id === currentBranchId) || branches[0];
  },
}));
