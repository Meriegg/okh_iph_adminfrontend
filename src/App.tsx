import { Route, Routes } from "react-router";
import { Page_LogIn } from "./pages/log-in";
import { Page_Account } from "./pages/account";
import { Page_ChangePassword } from "./pages/change-password";
import { Page_ChangePFP } from "./pages/change-profile-picture";
import { Page_SignUp } from "./pages/sign-up";
import { Page_ManageUsers } from "./pages/manage-users";
import { Page_ManageWebsite } from "./pages/manage-website";
import { Page_ManageLiveTV } from "./pages/manage-livetv";

function App() {
  return (
    <Routes>
      <Route index path="/" element={<Page_Account />} />
      <Route path="/change-password" element={<Page_ChangePassword />} />
      <Route path="/change-pfp" element={<Page_ChangePFP />} />
      <Route path="/auth/log-in" element={<Page_LogIn />} />
      <Route path="/auth/sign-up" element={<Page_SignUp />} />

      <Route path="/manage-users" element={<Page_ManageUsers />} />
      <Route path="/manage-website" element={<Page_ManageWebsite />} />
      <Route path="/manage-livetv" element={<Page_ManageLiveTV />} />
    </Routes>
  );
}

export default App;
