import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { DashboardPage } from "../../features/dashboard/pages/DashboardPage";
import { UsersListPage } from "../../features/users/pages/UsersListPage";
import { SitesListPage } from "../../features/sites/pages/SitesListPage";
import { RolesListPage } from "../../features/roles/pages/RolesListPage";
import { TemplatesListPage } from "../../features/templates/pages/TemplatesListPage";
import { TemplateBuilderPage } from "../../features/templates/pages/TemplateBuilderPage";
import { TemplatePreviewPage } from "../../features/templates/pages/TemplatePreviewPage";
import { InspectionsListPage } from "../../features/inspections/pages/InspectionsListPage";
import { InspectionDetailPage } from "../../features/inspections/pages/InspectionDetailPage";
import { InspectionFormPage } from "../../features/inspections/pages/InspectionFormPage";
import { SyncCenterPage } from "../../features/sync/pages/SyncCenterPage";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sites" element={<SitesListPage />} />
        <Route path="/users" element={<UsersListPage />} />
        <Route path="/roles" element={<RolesListPage />} />
        <Route path="/templates" element={<TemplatesListPage />} />
        <Route path="/templates/:templateId/builder/:versionId" element={<TemplateBuilderPage />} />
        <Route path="/templates/:templateId/preview" element={<TemplatePreviewPage />} />
        <Route path="/inspections" element={<InspectionsListPage />} />
        <Route path="/inspections/:inspectionId" element={<InspectionDetailPage />} />
        <Route path="/inspections/:inspectionId/form" element={<InspectionFormPage />} />
        <Route path="/sync" element={<SyncCenterPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
