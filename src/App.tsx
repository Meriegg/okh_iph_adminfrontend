import { Route, Routes } from "react-router";
import { Page_LogIn } from "./pages/log-in";
import { Page_Account } from "./pages/account";
import { Page_ChangePassword } from "./pages/change-password";
import { Page_ChangePFP } from "./pages/change-profile-picture";
import { Page_SignUp } from "./pages/sign-up";
import { Page_ManageUsers } from "./pages/manage-users";
import { Page_ManageWebsite } from "./pages/manage-website";
import { Page_ManageLiveTV } from "./pages/manage-livetv";
import { Page_ManageSchedule } from "./pages/manage-schedule";
import { Page_StartScraping } from "./pages/start-scraping";
import { Page_SubmitLinks } from "./pages/submit-links";
import { Page_ManageUserLinks } from "./pages/manage-user-links";

function App() {
  return (
    <Routes>
      <Route index path="/" element={<Page_Account />} />
      <Route path="/change-password" element={<Page_ChangePassword />} />
      <Route path="/change-pfp" element={<Page_ChangePFP />} />
      <Route path="/auth/log-in" element={<Page_LogIn />} />
      <Route path="/auth/sign-up" element={<Page_SignUp />} />

      <Route path="/submit-links" element={<Page_SubmitLinks />} />

      <Route path="/manage-users" element={<Page_ManageUsers />} />
      <Route path="/manage-website" element={<Page_ManageWebsite />} />
      <Route path="/manage-livetv" element={<Page_ManageLiveTV />} />
      <Route path="/manage-schedule" element={<Page_ManageSchedule />} />
      <Route path="/manage-user-links" element={<Page_ManageUserLinks />} />

      <Route
        path="/manage-schedule/start-scraping"
        element={<Page_StartScraping />}
      />
    </Routes>
  );
}

export default App;
