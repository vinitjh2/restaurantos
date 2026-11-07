import { create } from "zustand";
import { DEMO_BRANCHES, DEMO_RESTAURANTS, RestaurantBranch } from "@/lib/demo-data";

interface RestaurantState {
  organizations: typeof DEMO_RESTAURANTS;
  branches: RestaurantBranch[];
  currentOrgId: string;
  currentBranchId: string;
  isSidebarCollapsed: boolean;
  isSearchOpen: boolean;
  setOrganization: (orgId: string) => void;
  setBranch: (branchId: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  getActiveBranch: () => RestaurantBranch;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  organizations: DEMO_RESTAURANTS,
  branches: DEMO_BRANCHES,
  currentOrgId: DEMO_RESTAURANTS[0].id,
  currentBranchId: DEMO_BRANCHES[0].id,
  isSidebarCollapsed: false,
  isSearchOpen: false,

  setOrganization: (orgId) => set({ currentOrgId: orgId }),
  setBranch: (branchId) => set({ currentBranchId: branchId }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),

  getActiveBranch: () => {
    const { branches, currentBranchId } = get();
    return branches.find((b) => b.id === currentBranchId) || branches[0];
  },
}));
